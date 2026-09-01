# Follow-ups

Deferred work, triaged out of the review of the web borehole log page (August 2026). Each entry says
what is wrong, **why it is currently harmless**, and what would make it bite — because most of these
are latent, and knowing the trigger is the point.

Nothing here is a live user-facing bug. That is deliberate: live bugs get fixed, not filed.

## Known defects and debt

### 0. Four orphaned objects in the Storage bucket

All that is left of the old item 0, which was `block_photos` having RLS enabled with no policies at
all. That is fixed — see 0e.

Four objects in the `Testing` bucket have no `block_photos` row, so under the new Storage SELECT
policy nothing can name them and nobody can reach them:

```
5e530da9-6a2b-4b4d-957d-b5ac22149700.jpg
81bda8d0-ae7f-49d7-87f5-37d7bc39bf7c.jpg
9601d9ba-fec4-43e3-8bf5-37791555bf5e.jpg
fbce2ff4-3001-4bd2-bf4a-ad304f2af7d0.jpg
```

Re-derive rather than trusting that list — deleting a file is the one step here with no undo:

```sql
select o.name from storage.objects o
where o.bucket_id = 'Testing'
  and o.name <> '.emptyFolderPlaceholder'
  and not exists (select 1 from public.block_photos bp
                  where bp.id::text = split_part(o.name, '.', 1));
```

**Delete them from the dashboard** — Storage → Testing → select → Delete.

Two ways not to do it. `delete from storage.objects` removes only the metadata row and strands the
actual file in the storage backend, still billed and referenced by nothing. And
`pnpm sb storage rm ss:///Testing/<name>` **silently does nothing** on CLI 2.x for objects at the
bucket root: it reports `{"deleted":[]}` with no error and exits 0. Confirmed 2026-08-25 that this is
not an RLS refusal — it still no-ops with a wide-open delete policy on the exact object, so it is a
CLI bug. `pnpm sb storage ls ss:///Testing/` does work, with the trailing slash.

Leave `.emptyFolderPlaceholder`; the dashboard creates it and the bucket renders oddly without it.

### 0e. Resolved: the `blocks` and `block_photos` policies

Recorded because the previous version of this file said `blocks` was wide open in the deny-everything
sense, and anything written against that is out of date.

Applied 2026-08-25, from `packages/supabase/policies/blocks.sql`, which is now runnable reference SQL
rather than a record:

|            | select            | insert / update / delete |
| ---------- | ----------------- | ------------------------ |
| owner      | every block       | no                       |
| admin      | every block       | no                       |
| supervisor | assigned projects | assigned projects        |
| viewer     | assigned projects | no                       |

Owners and admins are read-only **deliberately**: the dashboard has no write path to `blocks` at all
(`BoreholePage.tsx` only reads), and granting a write nobody makes would be an untested policy. When
editing on web lands, add those policies then.

`blocks` has no `project_id`, so the correlation runs through `boreholes` via a new `security
definer` helper, `public.is_assigned_to_borehole_project(uuid)`. Definer for the same reason as
`shares_a_project_with()`: RLS applies to tables named inside a policy expression, so an inline
subquery would silently couple this policy to whatever the policies on `boreholes` and
`project_to_user` happen to be, failing as an empty result rather than an error.

Verified by simulating each role under RLS: owner and admin see all 10 blocks, supervisor and viewer
see 0 (neither is assigned to anything yet), an unassigned supervisor's insert is denied with 42501,
an assigned supervisor's succeeds, and both a viewer's and an owner's are denied.

#### `block_photos` and the Storage bucket, same day

`packages/supabase/policies/block_photos.sql` covers **both** halves of a photo, because either one
alone leaves a photo that exists and cannot be seen. `block_photos` mirrors the `blocks` table above
exactly, one correlation further out. `storage.objects` gets:

| | select | insert / delete |
| --- | --- | --- |
| owner / admin | every object | no |
| supervisor | assigned projects | any object in the bucket |
| viewer | assigned projects | no |

The two `select` rules match on purpose: a synced-down `block_photos` row is what makes the
attachment queue download a file, so a role that can read the row and not the object gets a silent
403 and no photo.

Storage `insert` and `delete` are role-gated with **no per-object lookup**, and that is the one place
this deviates from the table. A photo's bytes and its row travel over two independent queues with no
ordering guarantee, so a project-scoped check would deny whichever one won the race — and on delete
that is unrecoverable, because `onDeleteError` retries forever against an object whose row is already
gone. Object names are client-generated v4 UUIDs and listing goes through the project-scoped `select`,
so there is nothing to enumerate.

There is no Storage `update` policy: `uploadFile` never passes `upsert` and the queue treats
*"The resource already exists"* as non-retryable, so no code path updates an object in place.

Two new `security definer` helpers, `is_assigned_to_block(uuid)` and
`is_assigned_to_photo_object(text)`. Note the second: the correlation from an object back to a
project is a **lookup, not a path parse** — the attachment queue writes files flat at the bucket root
as `<block_photos.id>.jpg`, with no project or borehole anywhere in the name.

Applied in two passes — the scoped policies first, which changed nothing because the old wide-open
policy still OR'd over them, then every role simulated, then the drop. What was dropped:
`"Enable ALL for authenticated users only"` (`using(true) with check(true)` for every authenticated
user, on every bucket) and four `"folder 407ca8_*"` policies that had never matched anything, since
they required a `private/` prefix that no file has.

Verified after the drop: owner and admin see all 9 objects, an assigned supervisor or viewer sees the
4 on their project, an unassigned one sees none; and on `block_photos`, only an assigned supervisor
can insert.

### 0b. Mobile still reads and writes `borehole_to_user`, which no longer exists

`borehole_to_user` was dropped from the database when assignment moved to `project_to_user`. Mobile
was never updated:

- `apps/mobile/src/powersync/AppSchema.ts:5,53-66,116` still declares the table and registers it in
  the schema.
- `apps/mobile/src/db/borehole/addBoreholeDbAsync.ts:63-68` still inserts a row into it, in the same
  transaction as the borehole.

That insert enters the PowerSync CRUD queue and is uploaded against a table Postgres does not have.
`Connector.ts` rethrows on failure by design, so the entry is never acknowledged and **every later
upload queues behind it**. Adding one borehole on the device is enough to stall the whole sync.

*Fix:* delete the insert, drop the table from `AppSchema`, and drop the bucket from PowerSync's sync
rules (which live in the PowerSync dashboard, not this repo — they have to move in step or the field
app and the backend disagree about who can see what).

### 0c. `BoreholePage` reports "no data" when it means "no permission"

`apps/web/src/app/BoreholePage.tsx` renders *"No blocks logged — Nothing has been recorded for this
borehole yet"* whenever the blocks query returns an empty array. RLS returns an empty array rather
than an error, so a user who can list a borehole but cannot read its blocks gets that message and
goes looking for missing field data.

Still reachable after the 0e fix, and now for a reason that will come up routinely: `boreholes` lets
a user list a borehole they created (`created_by::uuid = auth.uid()`), while `blocks` has no such
clause — so a supervisor who created a borehole and was then unassigned from its project sees the
borehole and an empty log. The gap reappears any time the predicates on the two tables drift, which
they already have.

The page should tell the two apart rather than guess — for example by checking assignment explicitly
when the result is empty, and showing a permission message instead.

### 0d. Resolved: assignment moved from the borehole to the project

Recorded because the previous version of this file said the opposite, and anything written against
it will be wrong.

`borehole_to_user` is **gone** and `project_to_user` **exists**:

```
project_to_user(project_id uuid, user_id uuid, created_at, created_by, updated_at, updated_by,
                deleted_at, deleted_by)
  PRIMARY KEY (project_id, user_id)
  project_id -> projects(id)   ON DELETE CASCADE
  user_id    -> auth.users(id) ON DELETE CASCADE
```

`boreholes` correlates against it correctly. What was still outstanding as of 2026-08-25, and was
closed by the People panel work, is recorded in `packages/supabase/policies/project_to_user.sql`:

- `project_to_user` had a single policy, `select using (user_id = auth.uid())` — you could see your
  own assignment row and nobody else's, and no policy permitted a write at all.
- Both `projects` predicates were missing `pu.project_id = projects.id`, so one assignment granted
  select and update over **every** project.
- The bypass on `projects` and `boreholes` was `get_current_user_role() = 1`, owner only, so admins
  held their access purely through that missing correlation.

Still outstanding: the `blocks` policies (item 0) and the mobile side (item 0b). The soft-delete
columns on `project_to_user` are also unused and currently unusable — every predicate that reads the
table tests only for the row's existence, so a soft-deleted assignment would revoke nothing.
Unassigning therefore hard-deletes. Honouring `deleted_at` would mean teaching all four predicates
and PowerSync's sync rules about it in one pass.

### 0f. The borehole edit gate is stricter in the UI than in the database

`canEditBoreholeDetails()` in `apps/web/src/data/memberRoles.ts` admits owners and admins, and
`BoreholePage` passes `onEdit` to `BoreholeDetailStrip` only for them — so supervisors and viewers
see no pencil. The database is wider: the assignment-scoped update policy on `boreholes`, quoted in
`packages/supabase/policies/project_to_user.sql:202-215` as *"Users can only edit involved
boreholes"*, tests only for a `project_to_user` row, and that table carries no role. Any user
assigned to the project may update any of its boreholes.

*Why it is harmless now:* the dashboard is the only client that reads the role at all, and it does
not offer the control. Mobile is a supervisor's tool and is *meant* to write these fields — that
same policy is what makes the field app work.

*What makes it bite:* the moment the gap is treated as enforcement — a "viewers cannot change
anything" claim in a spec, or an auditor asking who could have edited a borehole. The answer today
is "anyone assigned to the project", not "owners and admins".

*Fix:* decide which of the two is the intended rule before changing either. Narrowing the policy to
`get_current_user_role() in (1, 2)` would lock mobile out of its own writes, so it is not a
one-liner; widening `canEditBoreholeDetails` to supervisors is the cheaper reconciliation if the
policy is the intended rule. The comment on the function records the same choice.

### 1. The web blocks query has no deterministic order

`apps/web/src/app/BoreholePage.tsx:121` selects blocks with no `ORDER BY`, and
`apps/web/src/blocks/sortAndReindexAllBlocks.ts` sorts on `topDepthInMetres` with a stable sort. Postgres
makes no promise about row order without `ORDER BY`, so blocks sharing a top depth are left in whatever
order the database happened to return and can swap between page loads.

*Why it is harmless now:* ties are between blocks of different types, which only affects display order,
not numbering.

*What makes it bite:* two blocks of the **same** type at the same top depth would get their indices
swapped, so `P4`/`P5` could trade places between loads. Overlapping blocks are normal in this domain — a
permeability test starting inside an SPT interval is called out in `CLAUDE.md`.

*Fix:* add a tiebreak that matches mobile's effective order. Mobile reads via
`SELECT * FROM blocks WHERE borehole_id = ?` against local SQLite, so its order is incidental too —
establish what it actually is before picking, otherwise the two clients will disagree.

### 2. `verifierSignDate` is hardcoded to null

`BOREHOLE_COLUMNS` in `apps/web/src/supabase/boreholeRow.ts` selects `verifier_sign_date` and
`mapBoreholeRow` right below it discards it, assigning `null` to the mapped `Borehole`. Left as-is
deliberately — changing it would silently alter behaviour — but one of the two is wrong: either the
column should be mapped, or it should stop being selected.

Now a one-line fix rather than a three-site one: the column list and the mapping used to be
copy-pasted into `ProjectPage`, `BoreholePage` and `AddBulkBoreholesModal`, and were consolidated
when the borehole edit modal needed a fourth copy.

### 3. `deserializeDateTime` turns null into the epoch

`apps/mobile/src/json/deserializeDateTime.ts` is `new Date(datetime)`. `new Date(null)` is
1970-01-01T00:00:00Z, not `null`, so any nullable `Date` deserialises to the epoch and contradicts its
own declared type.

*Why it is harmless now:* every render path for `installationDate` checks `otherInstallations !== NONE`
first — `renderEndOfBoreholeBlockToHtml.ts:15` returns an empty cell, and
`EndOfBoreholeBlockComponent.tsx:25` sits inside that guard — and
`checkAndReturnEndOfBoreholeBlock.ts:44` refuses to build such a block unless both dates are present.
A consequence worth noting: this makes the two inner null-guards, and the
`throwError('Installation Date and Time is Required')` at `renderEndOfBoreholeBlockToHtml.ts:19`,
**unreachable code**.

*What makes it bite:* editing is delete-then-re-add (`BlockDetailsInputForm.tsx:83`) and the edit form
seeds its state from the deserialised block (`EndOfBoreholeBlockDetailsInputForm.tsx:15`). The
installations dropdown only nulls the dates in its `onChange`. So opening an existing `NONE`
end-of-borehole block, changing the remarks, and saving without touching the dropdown writes the epoch
into the stored payload where `null` used to be. Nothing looks different; the data is just wrong from
then on.

The same one-liner also makes every block's `updatedAt` an epoch, which
`fetchAllBlocksByBoreholeIdDbAsync` then overwrites with the raw column *string* — so `Block.updatedAt`
is a string at runtime despite being typed `Date | null`. Nothing renders it.

The web parser (`apps/web/src/blocks/parseBlockPayload.ts`) handles this correctly and is unaffected.

### 4. `editBlockDbAsync` has its bind parameters in the wrong order

`apps/mobile/src/db/blocks/editBlockDbAsync.ts`:

```ts
`UPDATE blocks SET payload = ?, updated_at = ? WHERE id = ?`,
[serializeBlock(block), block.id, new Date().toISOString()]
```

`updated_at` receives the UUID and `WHERE id` receives a timestamp, so the statement matches zero rows
and saves nothing.

*Why it is harmless now:* it has no callers. Editing goes through delete-then-add at
`BlockDetailsInputForm.tsx:83`.

*What makes it bite:* the moment anyone wires it up. Edits would appear to work — the in-memory list
updates — and vanish on reload. Either fix the order or delete the file; it sits alongside the known
dead `db/db.ts` family.

### 5. SPT sample numbering is gated on two different fields

`reindexSptBlocks.ts` skips `disturbedSampleIndex` when `recoveryLengthInMillimetres === 0`;
`SptBlockComponent.tsx` prints `*` when `recoveryInPercentage === 0`. They normally agree, so this was
left alone on purpose.

The web port follows the **reindexer**, since that is what reaches the PDF, and prints `*` whenever the
index is negative — so it cannot render `D-1` even if the two rules ever diverge.

*Note 2026-08-29:* `packages/report` now owns the printed row and follows the **component's** rule
(`recoveryInPercentage === 0`), which is what the old PDF renderers used — see `sampleNumber()` in
`rows/blockRowSpec.ts`. So the report and the web log can still disagree if the two fields ever
diverge. Still deliberately left alone; the fix is to pick one field.

### 6. `ProjectPage`'s progress summary is fabricated

`apps/web/src/app/ProjectPage.tsx` derives completion from `Math.round(boreholes.length * 0.7)` and
feeds it to both the donut and the Completed/Remaining stats, and the boreholes table's status column
reads off the same number — so 70% of every project is always "Completed". Placeholder pending a real
way to classify a borehole as complete. Worth removing or labelling before anyone reads the dashboard
as reporting.

The borehole log page deliberately has no status badge rather than invent a second fake one.

*Half resolved 2026-08-25:* the hardcoded five-name team list is gone. The panel is now **People** and
reads `project_to_user`. The fabricated completion figures are untouched.

### 7. `packages/core` is still duplicated into `apps/mobile`

Core now exports the block domain (interfaces, `*_BLOCK_TYPE_ID` constants, `DayWorkStatus`, symbols) and
the web app consumes it. `apps/mobile` still keeps its own hand-synced copy of all of that **and** the 18
per-type deserializers under `src/json/**`.

*Half resolved 2026-08-29:* the risky half is done. `apps/mobile/metro.config.js` now exists and mobile
depends on `@mmsb/core` and `@mmsb/report`; workspace resolution through pnpm's symlinks is proven on a
real device. Note `disableHierarchicalLookup` is deliberately NOT set — pdf-lib resolves via
`packages/report/node_modules`, which that flag would break.

What remains is only the mechanical part: making `apps/mobile/src/interfaces/**` re-export from
`@mmsb/core` instead of duplicating it, plus the 18 per-type deserializers under `src/json/**`. The
diff is now known to be import-style only, apart from `Project.terminationCriteria`.

Also still dead: `packages/core/src/constants/textSize.ts` — not exported from `index.ts` and not
deep-imported anywhere. It exists only for the old HTML PDF font sizing. Mobile's copy is still in
use by the parked legacy pipeline; remove both when that pipeline goes.

### 8. The old HTML PDF pipeline is parked, not deleted

`apps/mobile/src/utils/pdf/` still contains the pre-2026-08 HTML + `expo-print` renderer — 29
`render*ToHtml.ts` files plus the two platform generators and `generatePdfPages.ts` — entered via
`sharePdfLegacyHtml.ts`. Nothing references it; it is kept only as a fallback until `@mmsb/report`
has been validated against real boreholes on real devices.

Deleting it is ~2,000 lines and also retires `expo-print` and `apps/mobile/src/constants/textSize.ts`.
Do it once the cross-device `shasum` check has passed on production data.

### 9. Four rock legend codes point at images that do not exist

`apps/mobile/src/constants/rock.ts:167-170` (and the identical copy in `packages/core`) defines
`GRANITE_ROCK_CODE = 840`, `SCHIST_ROCK_CODE = 873`, and `PHYLLITE_ROCK_CODE = SLATE_ROCK_CODE = 872`.
The legend images the borelog report draws from are numbered 801-817 in the 8xx range, so none of
those four resolve. A real workbook uses **810** for granite. The other nine rock codes are correct
(claystone/mudstone 801, siltstone 802, sandstone 803, limestone 804, breccia 807, conglomerate 808,
gneiss 814, shale 817, others 999), and every soil code checks out against real logs — `SILT` +
`sandy` -> 303, `SAND` + `clayey` -> 402, and so on.

This went unnoticed because until the Excel exporter nothing *read* these codes: the input forms
write `soilCode`/`rockCode`, the deserializers revive them, and `packages/report` never touches
them. `@mmsb/ags-excel` is their first consumer, and it writes them into `GEOL_LEG`, which is what
selects each stratum's hatch image. So every cored borehole currently exports a legend code with no
image behind it.

Only granite (810) is evidenced. Confirm the other three against the legend set before changing them
rather than inferring from one workbook.

### 10. `SoilProperties` cannot express two secondary soil types

Real logs use legend code `407` for "Silty/Clayey SAND", but `getSoilCode` can never emit it:
`SoilProperties` carries a single `secondarySoilType`, so it can say silty *or* clayey, not both.
The Excel exporter writes 403 or 402 where a human wrote 407. Harmless today — it picks a real,
adjacent legend — but it is a modelling gap, not a rounding decision.

### 11. Hand-auger samples have no recovered length

`HaBlock` has no penetration or recovery field, so the Samples sheet gets the block's full interval
where a human writes the actual recovery: a real workbook has `HA1` spanning 1.0-1.3 m, and the
exporter writes 1.0-2.0. Every other sample type has a real source — SPT is top plus total
penetration, UD/MZ/PS is `penetrationDepthInMetres`, coring is the block interval.

## Deferred features

- **Editing blocks on web.** The log is read-only. This is also the point at which the dashboard would
  need write access to `blocks`, which is a product decision rather than plumbing.
- ~~**PDF generation on web.**~~ *Done 2026-08-29.* The tick arithmetic moved out of the mobile
  generator into `packages/report`, which is platform-free, so `apps/web` now generates the identical
  report. `scaleTickIndexWrapper` is gone — `paginate()` is pure. The renderer is behind a dynamic
  `import()` because pdf-lib + fontkit are ~1.1 MB.
- ~~**Block photos on web.**~~ *Done 2026-08-30.* The backend half was already in place — the two
  policies this entry asked for both landed on 2026-08-25 (see *`block_photos` and the Storage bucket*
  above), so this was web client code only. Each log row grew a fixed 200px third column of thumbnails
  with a `+N` badge for overflow, and clicking one opens a block-scoped gallery. The whole address
  scheme is that the attachment queue writes files flat at the bucket root as `<block_photos.id>.jpg`,
  so `apps/web/src/supabase/blockPhotos.ts` derives the storage key from the row id and batch-signs
  with `createSignedUrls` — signed URLs work whether or not the bucket is public, which is what keeps
  the bucket's dashboard-only privacy flag from mattering. Two wrinkles worth remembering: the
  `block_photos` query is chunked at 100 block ids because `.in()` serialises into the URL, and a row
  whose bytes have not uploaded yet fails on its own path and is skipped rather than failing the batch.
  Mobile's log view still does not render photos; they only appear in the camera component.
- **Excel export for mobile.** `@mmsb/ags-excel` is platform-free by construction — the build
  tsconfig has no node types, so an `import 'node:fs'` in `src` is a compile error — and it takes
  template bytes in and gives workbook bytes back. The field app could reuse it as-is by loading the
  template through `expo-asset` the way `loadReportAssets.ts` loads the report's fonts. Not done
  because the office is where the AGS submission is assembled.
- ~~**Water Strike sheet.**~~ *Done 2026-09-01.* It is derived from the Progress rows rather than
  mapped from blocks: `buildProgressRows` already resolves one entry per shift boundary with the
  `NIL`/`FULL` sentinels turned into null, so `toWaterStrikeRows` is a filter over that. The
  awkwardness this entry warned about is still real and now just implicit — nothing records a strike
  as a distinct event, so what the sheet reports is the standing water level at each shift boundary,
  not the depth at which water was first met. Columns G (`WSTK_NMIN`), H (`WSTK_SEAL`) and I
  (`WSTK_FLOW`) have no source and are left alone.
- **`Water Strike - AGS` column G has a leftover autofill formula.** From row 422 down, `WSTK_NMIN`
  is `IF(AND(B422="",C422=""),"",20)` — 4,579 formula cells the template's author left behind. The
  exporter does not write column G, so a workbook with more than 416 water-strike rows will show a
  spurious `20` in every row past that point *if someone opens it in Excel*. The Python consumer
  reads the cached blank and never sees it, so this is latent. It bites at ~105 boreholes in one
  workbook (four shift boundaries each). The fix, if it ever matters, is to write an explicit blank
  into G on the rows we fill.
- **Detail Description and Backfill sheets.** The template has both; the exporter fills neither,
  because the borelog report's Python has no parser for either — nothing reads what they would
  contain. Each is one more row-mapper in `packages/ags-excel/src/map/`.
- **`Geology - AGS` intervals no longer partition the hole.** *Changed 2026-09-01.* In-situ tests
  (the three permeability tests, Lugeon, vane shear, pressuremeter) now get their own row, because
  `GEOL_DESC` is what the report draws the description column from and dropping them lost text a
  human had entered. But a test sits *inside* its host block's interval — the PDF folds it onto the
  host's row via `collapsePairs.ts` — so `GEOL_TOP`/`GEOL_BASE` now overlap. Anything downstream
  that treats the Geology rows as a non-overlapping partition of the borehole (a stratum-thickness
  sum, a legend-hatch fill that walks top-to-base) will double-count. The report's own parser reads
  the rows in order and does not, which is why this was acceptable.
- **One workbook per project, on the report's side.** The exporter already emits multi-hole
  workbooks — every sheet is keyed by `HOLE_ID` and the ProjectPage button fills every borehole.
  The consuming Python still assumes one hole: its borehole parser reads row 6 and stops, while
  every other parser already loops.
- **Fields the AGS sheets want that the data model has no source for**, all left blank for a human
  rather than invented: `HOLE_TYPE` (an AGS code such as `RC`, where `typeOfBoring` is free text),
  `HOLE_BACD`, `HOLE_STAT`, `CORE_SREC`, `CORE_DIAM`, `SAMP_DIA`, `SAMP_DESC`, `WSTK_NMIN`,
  `WSTK_SEAL`, `WSTK_FLOW`, and the Project sheet's contractor, date and remarks. Real human-filled
  workbooks leave most of these blank too. Two came off this list on 2026-09-01: `HOLE_TYPE` is now
  the constant `RC` (the template already pre-filled `RC` from row 7 down, so only the first hole was
  ever actually blank), and `PROJ_ENG` is the project's consultant — it had been going to `PROJ_CONT`
  via the Project sheet's D9 instead of D7.
