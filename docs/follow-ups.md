# Follow-ups

Deferred work, triaged out of the review of the web borehole log page (August 2026). Each entry says
what is wrong, **why it is currently harmless**, and what would make it bite — because most of these
are latent, and knowing the trigger is the point.

Mostly nothing here is a live user-facing bug — live bugs get fixed, not filed. But an entry filed as
latent has twice turned out not to be (items 2 and 12), so "why it is currently harmless" is a claim
to re-check, not to inherit.

## Known defects and debt

### 0. Resolved: four orphaned objects in the Storage bucket

Two things in sequence, both now closed. First `block_photos` had RLS enabled with no policies at
all — fixed, see 0e. That left four objects in the `Testing` bucket with no `block_photos` row, so
under the new Storage SELECT policy nothing could name them and nobody could reach them.

*Resolved 2026-09-03* by the bucket rename (e78a6d8), which did not migrate `Testing`'s 24
development objects and deleted the bucket. Deleting a bucket deletes its contents, so the four went
with the other twenty. Verified after the fact:

```bash
pnpm sb --experimental storage ls                      # ["documents/","block-photos/"] — no Testing
pnpm sb --experimental storage ls ss:///block-photos/  # {"paths":[]}
```

Note the `--experimental` flag, which `storage` now requires; without it the CLI fails with
`LegacyExperimentalRequiredError`. Two ways *not* to delete an object, if this comes up again for
`block-photos`. `delete from storage.objects` removes only the metadata row and strands the actual
file in the storage backend, still billed and referenced by nothing. And
`pnpm sb --experimental storage rm ss:///<bucket>/<name>` **silently does nothing** on CLI 2.x for
objects at the bucket root: it reports `{"deleted":[]}` with no error and exits 0. Confirmed
2026-08-25 that this is not an RLS refusal — it still no-ops with a wide-open delete policy on the
exact object, so it is a CLI bug. `ls` does work, with the trailing slash. So: the dashboard.

If a bucket needs the orphan query again, it is:

```sql
select o.name from storage.objects o
where o.bucket_id = 'block-photos'
  and o.name <> '.emptyFolderPlaceholder'
  and not exists (select 1 from public.block_photos bp
                  where bp.id::text = split_part(o.name, '.', 1));
```

Leave `.emptyFolderPlaceholder` in any bucket that has one; the dashboard creates it and the bucket
renders oddly without it.

*Where they came from — answered 2026-09-02, and the reason the class of bug outlives the four
files.* **Every foreign key in the `public` schema cascades**, `user_to_role.role_id -> roles` alone
excepted:

| child | constraint | parent | on delete |
| --- | --- | --- | --- |
| `block_photos.block_id` | `block_photos_block_id_fkey` | `blocks` | cascade |
| `blocks.borehole_id` | `blocks_borehole_id_fkey` | `boreholes` | cascade |
| `blocks.block_type_id` | `blocks_block_type_id_fkey` | `block_types` | cascade |
| `boreholes.project_id` | `boreholes_project_id_fkey` | `projects` | cascade |
| `project_to_user.project_id` / `.user_id` | | `projects`, `auth.users` | cascade |
| `user_to_role.user_id` | | `auth.users` | cascade |
| `user_to_role.role_id` | `profiles_role_id_fkey` | `roles` | no action |

```sql
select conrelid::regclass::text as child, conname, confrelid::regclass::text as parent, confdeltype
from pg_constraint where contype = 'f' and connamespace = 'public'::regnamespace order by 1;
-- 'c' = cascade, 'a' = no action
```

So item 4's edit path was a sufficient explanation for those four: the block delete synced to
Postgres, the cascade took the `block_photos` rows with it, and nothing deletes from Storage — the
only deleter is a *device* noticing its own row disappear (`SupabaseRemoteStorageAdapter.ts`), which
never fires for a delete that happened server-side. Item 4's fix stops new ones from that direction;
a cascade from any other direction still strands bytes, which is the whole of the borehole-delete
entry below. There is no dangling-row class to look for — with a cascade there cannot be one.

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

### 0b. Resolved: mobile no longer reads or writes `borehole_to_user`

`borehole_to_user` was dropped from the database when assignment moved to `project_to_user`. Mobile
was never updated:

- `apps/mobile/src/powersync/AppSchema.ts:5,53-66,116` still declares the table and registers it in
  the schema.
- `apps/mobile/src/db/borehole/addBoreholeDbAsync.ts:63-68` still inserts a row into it, in the same
  transaction as the borehole.

That insert enters the PowerSync CRUD queue and is uploaded against a table Postgres does not have.
`Connector.ts` rethrows on failure by design, so the entry is never acknowledged and **every later
upload queues behind it**. Adding one borehole on the device is enough to stall the whole sync.

*Fixed 2026-09-01.* The insert is gone from `addBoreholeDbAsync` — with one statement left, the
`writeTransaction` collapsed to a plain `db.execute`, since the transaction existed only to make the
pair atomic — and the table, its exported name constant and its `Schema` entry are gone from
`AppSchema.ts`. The PowerSync sync rules were moved separately in the dashboard, which is where they
live.

**This does not unstick a device that already queued one.** The failing op sits in PowerSync's local
`ps_crud` queue, and removing the table from `AppSchema` does not clear it — an already-wedged device
needs its app data cleared or a reinstall. No app-code change can reach it.

### 0c. `BoreholePage` reports "no data" when it means "no permission"

*Re-analysed 2026-09-02, and the trigger this entry used to give does not exist. Left open, because
the defect underneath it does — but it is a different one, and narrower than it looked.*

`apps/web/src/app/BoreholePage.tsx:390-405` renders *"No blocks logged — Nothing has been recorded
for this borehole yet"* whenever the blocks query returns an empty array. RLS returns an empty array
rather than an error, so nothing distinguishes "no field data" from "not yours to read".

The scenario this entry claimed — a supervisor who created a borehole, was unassigned, and sees the
borehole with an empty log — **cannot happen through this page.** The effect reads `projects` first
(`:119`, `fetchProjectByCode`), and the `projects` SELECT policy is assignment-only with no
`created_by` clause and no role fallback (`policies/project_to_user.sql:133-144`). An unassigned
supervisor therefore fails at the *project* query, whose `.single()` throws PGRST116, and lands in
the "Unable to load borehole" card. Walking the four roles: owner and admin bypass all three tables;
an assigned supervisor or viewer passes all three; an unassigned one never reaches the blocks query;
and a removed member (`get_current_user_role()` null) is stopped earlier still by `ProtectedRoute`.

So the reachable defect is the error path, not the empty one: **that card shows raw PostgREST text**
(`:172-181` assigns `error.message` verbatim), so "you are not on this project" reads as
*"JSON object requested, multiple (or no) rows returned"*. Fixing it means `.maybeSingle()` on both
lookups and a purpose-written "not found, or you do not have access" message.

The empty-blocks lie is still real, just latent: it needs the `boreholes`/`blocks` predicates to
drift apart *and* something to admit a user the `projects` policy would not. The drift-proof guard,
if it is ever wanted, is to call the blocks policy's own predicate rather than restate it —
`is_assigned_to_borehole_project(borehole_id)` is `security definer` and executable by
`authenticated`, so `supabase.rpc()` reaches it, and combined with a client-side `role in (1, 2)`
it *is* the SELECT predicate on `blocks`.

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

### 0f. Resolved: who may edit a borehole, and who may rename one

Recorded because the previous version of this entry said the database was wider than the UI and
asked for the rule to be decided before either side moved. It has been decided.

Applied from `packages/supabase/policies/boreholes.sql`, which is now the single record for that
table — the owner/admin policy and the two assignment-scoped ones used to be split between
`project_to_user.sql` and the dashboard:

|                | select            | rename | edit the other fields |
| -------------- | ----------------- | ------ | --------------------- |
| owner (1)      | every borehole    | yes    | yes                   |
| admin (2)      | every borehole    | yes    | yes                   |
| supervisor (3) | assigned projects | no     | assigned projects     |
| viewer (4)     | assigned projects | no     | no                    |

Two things changed. The update policy *"Users can only edit involved boreholes"* carried no role at
all, so any assigned user — a viewer included — could change any field of any borehole on their
project; it is replaced by `"supervisors update boreholes on their projects"`, the same shape as the
supervisor policies in `blocks.sql`. And the name became immutable below admin.

**The name needed a trigger, not a policy.** A policy predicate sees the old row (`using`) or the
new row (`with check`), never both, so "this column may not change" is not expressible as one.
`boreholes_name_immutable` (BEFORE UPDATE OF name) is the first trigger in the `public` schema. Two
alternatives were rejected and are worth not re-discovering: `revoke update (name)` is a no-op while
table-level UPDATE is granted, and re-reading the old name in a `with check` subquery rests an
access rule on statement-snapshot semantics.

*Why the name and not the other fields.* It is the dashboard's URL key
(`/projects/:projectCode/boreholes/:boreholeName`), it is what the report and the AGS export are
filed under, and there is **no unique constraint on `(project_id, name)`** — `AddBulkBoreholesModal`
checks for duplicates only within the batch being pasted. `EditBoreholeModal` now checks the project
for a clash before renaming and `BoreholePage` replaces the router entry afterwards, but the
constraint itself is still missing. That is the remaining piece of this: nothing stops two boreholes
on one project sharing a name if they are created in two separate pastes, which makes
`fetchBoreholeByProjectIdAndName` ambiguous and one of them unreachable.

*Clients, and the two different failure modes.* RLS on UPDATE and DELETE **filters** rows — a write
no policy admits affects nothing and reports success — while a trigger **raises**. So:

- Mobile does not send `name` at all. `editBoreholeDbAsync` has no `name = ?` in its SET list and
  `EditBoreholeInputForm` renders the name as text. A rejected rename would be an error, and
  `Connector.ts` rethrows rather than calling `transaction.complete()`, so one would stall every
  upload queued behind it on that device.
- Mobile's borehole delete button was removed rather than made to work. `boreholes` has no delete
  policy for supervisors, so the handler removed the row locally, PostgREST reported success having
  deleted nothing, and the next sync brought the borehole back.

**Still open: mobile cannot create a borehole either.** `boreholes` has no supervisor INSERT policy,
and insert is the one verb that *does* raise 42501 rather than filtering — so unlike the delete
above, an add from the field app would stall that device's CRUD queue rather than silently doing
nothing. Nothing was changed about this, because the Add-borehole footer in
`apps/mobile/src/app/project/[id].tsx` (`ListFooterComponent={renderFooter()}`, and the reason
`renderFooter` reads as an unused variable when it is commented out) has been switched on and off
during development. **Check that line before shipping a build**: live footer plus no insert policy is
a stalled queue on the first borehole anyone adds. Either keep it off, or add
`"supervisors insert boreholes on their projects"` alongside the update policy first — and decide
then whether a supervisor naming a new borehole is consistent with not being able to rename one.

### 1. Resolved: block order is deterministic on both clients

Neither client had an order worth matching. Web sorted on `topDepthInMetres` alone with a stable sort
over rows Postgres returned for a query with no `ORDER BY`; mobile did the same over
`SELECT * FROM blocks WHERE borehole_id = ?`, which on device is a full scan of a PowerSync view
declared with `{ indexes: {} }` over `json_extract` columns — so its tie order is local rowid order,
i.e. whatever order sync happened to insert rows in, and it changes on reinstall.

*Fixed 2026-09-02* by adding the same second sort key to both copies: depth, then `id`. `id` is the
only key that is total, non-null and identical on both clients, and
`apps/web/src/supabase/fetchBoreholeStatuses.ts` already used it as the stable key for `blocks`. The
two implementations agree on numbering for a given array order — web's single-pass rule table and
mobile's per-type loop both consume the array in order — so one shared tiebreak is the whole fix.
`apps/mobile/src/utils/block/sortBlocksFunctions/sortBlocks.ts` also stopped sorting the caller's
array in place, which web never did.

The two web queries that had no `ORDER BY` (`BoreholePage.tsx` and `fetchBlocksByBoreholeIds.ts`) now
carry `.order('id')` as well. That is for reproducibility while debugging, not correctness — the
in-memory sort is what the numbering depends on.

### 2. Resolved: `verifierSignDate` is mapped

`BOREHOLE_COLUMNS` in `apps/web/src/supabase/boreholeRow.ts` selected `verifier_sign_date` and
`mapBoreholeRow` right below it assigned `null` regardless.

This was filed as latent and was not: `packages/report/src/build/buildFooter.ts:167` draws the
verifier date, and web has generated PDFs since 2026-08-29 — so the same borehole exported from the
dashboard and from the field app disagreed. What hid it is that nothing has ever written the column
(all 17 rows are null as of 2026-09-02), so the two outputs happened to match.

*Fixed 2026-09-02.* The mapping is `toDate(row.verifier_sign_date)`, the same shape mobile uses at
`fetchBoreholeByIdAsync.ts`. `toDate` is now shared — see item 3.

### 3. Resolved: `deserializeDateTime` turned null into the epoch

`apps/mobile/src/json/deserializeDateTime.ts` was `new Date(datetime)` typed `Date`. `new Date(null)`
is 1970-01-01T00:00:00Z, not `null`, so every nullable `Date` deserialised to the epoch and
contradicted its own declared type.

It was reachable, not theoretical. Editing is a payload rewrite seeded from the deserialised block
(`EndOfBoreholeBlockDetailsInputForm.tsx`), and the installations dropdown is the only thing that
nulls the dates (`EndOfBoreholeInputQuestions.tsx`) — so opening an existing `NONE` end-of-borehole
block, changing the remarks and saving without touching the dropdown wrote the epoch into the payload
where `null` used to be. Nothing looked different. Checked before the fix: 0 of 21 stored payloads
carry an epoch, so no data was corrupted.

*Fixed 2026-09-02*, by deleting the function rather than patching it — see item 7's Layer C. Both
clients now parse through `toDate` in `@mmsb/core`, which returns `Date | null` and also maps an
Invalid Date to null instead of letting it render as `NaN/NaN/NaN`. Two consequences worth knowing:

- The same change removed `fetchAllBlocksByBoreholeIdDbAsync`'s habit of overwriting `createdAt` and
  `updatedAt` with the raw column *strings* on top of the deserialised value, so `Block.updatedAt` is
  no longer a string at runtime despite being typed `Date | null`.
- The two inner null-guards this entry used to call unreachable — `EndOfBoreholeBlockComponent.tsx`
  and the `throwError('Installation Date and Time is Required')` in `renderEndOfBoreholeBlockToHtml.ts`
  — are reachable again, because a `NONE` block now really does carry `null`.

### 4. Resolved: the edit path re-minted the block id and orphaned its photos

`apps/mobile/src/db/blocks/editBlockDbAsync.ts`:

```ts
`UPDATE blocks SET payload = ?, updated_at = ? WHERE id = ?`,
[serializeBlock(block), block.id, new Date().toISOString()]
```

`updated_at` receives the UUID and `WHERE id` receives a timestamp, so the statement matches zero rows
and saves nothing.

*Why it is harmless now:* it has no callers. Editing goes through delete-then-add at
`BlockDetailsInputForm.tsx:83`.

*Fixed 2026-09-01, and the dead function turned out to be hiding a live bug.* Asking whether it was
safe to delete surfaced what the delete-then-add path it had been standing in for was actually doing.

Every `checkAndReturn*` ends in `id: randomUUID()` — all 18 of them — so an edit deleted the block row
and inserted a **new one under a new id**. Meanwhile `CameraComponent.tsx:110` loads existing photos as
`isNew: false, deletedAt: null`; its first loop handles `isNew && !deleted` and its second
`!isNew && deleted`, so **a kept existing photo matched neither** and nothing re-pointed its
`block_photos.block_id`. Editing a block therefore stranded every photo already on it: not deleted,
orphaned on a block id that no longer existed, invisible in both apps. And because
`is_assigned_to_photo_object()` resolves an object through `block_photos -> blocks`, an orphaned row
returns NULL and the Storage read policy denies it, so the file became unreachable while still being
billed. This is a candidate explanation for item 0's four orphaned objects, but only under one
condition — see the note there before treating it as the answer.

The fix was the root cause rather than the symptom: the id is preserved on an edit (overridden once in
`BlockDetailsInputForm`'s confirm handler, rather than in all 18 check functions), `editBlockDbAsync` is
now a real `UPDATE` with its binds in the right order, and a new `editBlockAsync` sits beside
`addBlockAsync`/`deleteBlockAsync`. `block_type_id` is in the SET list because the form lets the
operation type change on an edit. No third loop in `CameraComponent` was needed — with the id stable,
the photos were never detached.

Two further consequences went with it: `created_at` no longer resets on every edit, and the CRUD queue
no longer carries a DELETE followed by an INSERT, a window in which a crash lost the block outright.

Still not set: `updated_by`. `addBlockDbAsync` does not set `created_by` either, and populating one half
of that pair would be inconsistent — both belong in one later pass.

### 5. Resolved: one field decides a sample number

Three places decided independently whether a sample gets a number or a `*`:
`reindexSptBlocks.ts` withheld the index when `recoveryLengthInMillimetres === 0`;
`SptBlockComponent.tsx` and `packages/report`'s `sampleNumber()` printed `*` when
`recoveryInPercentage === 0`; and `apps/web`'s `blockGutterSpec.ts` printed `*` when the index was
negative. The first two normally agree because the percentage is *derived* from the length — but
through `.toFixed(1)` (`checkAndReturnSptBlock.ts`), so a nonzero length under 0.05 % of penetration
rounds to `0` and they part company. The defaults part company too: both fields seed `-1`, which
satisfies neither rule.

*Fixed 2026-09-02.* `recoveryLengthInMillimetres` wins, and every consumer now reads it the way web
already did — **off the reindexer's output** (`index < 0`) rather than re-deriving the rule. That
makes the reindexer the single decision point, and it generalises: UD/MZ/PS and coring keep their own
`recoveryInPercentage` / `coreRecoveryInPercentage` rules without a special case, because their
reindexers encode them.

Changed: `sampleNumber()` in `packages/report/src/rows/blockRowSpec.ts` (now takes the index alone,
covering SPT, UD/MZ/PS and coring) and the five `src/components/blockComponents/*BlockComponent.tsx`
that printed the star.

A fourth consumer had no rule at all: `packages/ags-excel`'s `sampleOf()` emitted the literal
reference `D-1/P3` into the Samples sheet for a zero-recovery SPT. It now returns `null` for a
negative index — nothing recovered is no sample — which is the path it already took for a hand-auger
interval with `requireSample` false. Returning a `D*` reference instead was rejected: `SAMP_REF` is a
key, and a second no-recovery sample in the same hole would repeat it.

`apps/mobile/src/utils/pdf/renderSptBlockToHtml.ts` and its siblings were **not** changed — see item
8, they are the parked pipeline and now disagree with the live one.

### 6. Resolved: `ProjectPage`'s progress summary is derived from the blocks

`apps/web/src/app/ProjectPage.tsx` derives completion from `Math.round(boreholes.length * 0.7)` and
feeds it to both the donut and the Completed/Remaining stats, and the boreholes table's status column
reads off the same number — so 70% of every project is always "Completed". Placeholder pending a real
way to classify a borehole as complete. Worth removing or labelling before anyone reads the dashboard
as reporting.

The borehole log page deliberately has no status badge rather than invent a second fake one.

*Half resolved 2026-08-25:* the hardcoded five-name team list went. The panel is now **People** and
reads `project_to_user`.

*Fully resolved 2026-09-01.* `apps/web/src/supabase/fetchBoreholeStatuses.ts` derives the status from
the blocks — no blocks is `notStarted`, an End of Borehole block is `completed`, anything else is
`inProgress` — and `apps/web/src/data/boreholeStatus.ts` holds the labels, badge classes and tallies.
The donut, the Completed/Remaining tiles and the table's status column now all read the same derived
map, so they cannot disagree.

Two things about it worth keeping: the status is derived on every read rather than stored on the
borehole row, because the main writer of blocks is the offline app draining a CRUD queue and a stored
copy would sit there labelled wrong after a failed sync with nothing to notice. And the read is
**paged** at 1000 — it is the one query in the web app that already does what item *`fetchBlocksByBoreholeIds`
reads only the first page* asks for, and is the worked example to copy.

### 7. Resolved: `apps/mobile` no longer duplicates `packages/core`

The repo's main structural debt, closed 2026-09-02 in three layers.

**Layer A — constants.** `packages/core/src/index.ts` now exports `colour`, `rock`, `soil` and
`textSize` alongside the four it already did, and mobile's eight copies are gone. Six of the eight
were byte-identical; `DayWorkStatus.ts` differed only in `import type`. `rock.ts` differed in
`SCHIST_ROCK_CODE` — 812 in mobile, 813 in core, drifted apart in `fbbf41f` — which is exactly the
failure this entry existed to stop. Core's 813 won; see item 9.

**Layer B — interfaces.** `apps/mobile/src/interfaces/**` is deleted and its ~203 importers rewritten
to `@mmsb/core`. Two files stayed: `Project.ts`, because mobile must not gain `terminationCriteria`,
and `Migration.ts`, which imports `expo-sqlite` and is part of the dead pre-PowerSync `src/db/**`
tree. Everything else differed from core by import style alone.

**Layer C — the JSON tree.** This turned out to be a deletion, not a move. All 44 files under
`apps/mobile/src/json/**` were pure field copying — the 18 serializers were one line of
`JSON.stringify(block)` each, and the per-type deserializers copied every field verbatim. The only
semantic work in the tree was `Date` revival, which `apps/web/src/blocks/parseBlockPayload.ts` already
did generically and exhaustively. That file moved into `packages/core/src/json/` as `parseBlock`,
`serializeBlock`, `parseUntilObject` and `toDate`; both clients call it; the 44 files and
`src/utils/json/parseUntilObject.ts` are gone. Only six mobile files imported from that tree.

Being explicit field-by-field was itself the hazard this entry warned about: a hand-written copy omits
a new field silently, where a spread carries it.

*Still dead:* `packages/core/src/constants/textSize.ts` has exactly one consumer, the parked HTML PDF
pipeline. It is exported now so mobile stopped carrying a second copy; delete it with that pipeline.

#### The EAS question, answered

*Can the mobile app still be built through EAS with the domain living in a workspace package?* **Yes,
and it already was** — `@mmsb/core`'s raw TypeScript has been in the device bundle since the
`@mmsb/report` migration, because report imports runtime constants (not just types) from core in five
files on the live `sharePdf` path. Direct imports only add a second edge to a node already in the
graph. Verified with a full `npx expo export --platform android`: 1,895 modules, bundled clean.

What makes it work is `apps/mobile/metro.config.js`: `watchFolders = [workspaceRoot]` puts
`packages/*/src/*.ts` inside Metro's project scope, so `babel-preset-expo` transpiles it like app
source. Nothing resolves to `dist/` — it is gitignored, untracked, and EAS runs no build step before
bundling (`apps/mobile` has no `build` task, and there are no `eas-build-*` or `postinstall` hooks
anywhere in the repo).

Three traps, all of which fail at your desk rather than on EAS if you run the pre-flight:

1. **No deep imports.** `@mmsb/core`'s exports map is `{".": "./src/index.ts"}` with no subpath
   pattern, so `@mmsb/core/interfaces/Block` fails in Metro (`unstable_enablePackageExports` defaults
   to true) *and* in tsc (`resolvePackageJsonExports`, via `expo/tsconfig.base`). Anything mobile
   needs must be in `src/index.ts`.
2. **Do not set `resolver.disableHierarchicalLookup`.** It would break `pdf-lib` resolving from
   `packages/report/node_modules`; the comment in `metro.config.js` says so.
3. **Do not point core's `main` at `dist/`.** It would never reach the EAS builder.

Pre-flight, in order: `pnpm --filter apps/mobile check-types`, then
`cd apps/mobile && npx expo export --platform android`. `pnpm build` does not cover the second — it
never touches the mobile app.

One more thing core's compiler settings enforce, discovered while moving the parser in:
`@mmsb/ags-excel` compiles core's `src` under `lib: ["ES2020"]` with no node and no DOM types. So
`console` is out of scope in `packages/core`, and so is `new Error(msg, { cause })`, which is ES2022.
Core's own tsconfig inherits nothing and would not have caught either.

### 8. The old HTML PDF pipeline is parked, not deleted

`apps/mobile/src/utils/pdf/` still contains the pre-2026-08 HTML + `expo-print` renderer — 29
`render*ToHtml.ts` files plus the two platform generators and `generatePdfPages.ts` — entered via
`sharePdfLegacyHtml.ts`. Nothing references it; it is kept only as a fallback until `@mmsb/report`
has been validated against real boreholes on real devices.

Deleting it is ~2,000 lines and also retires `expo-print` and `packages/core/src/constants/textSize.ts`
(mobile's copy went with item 7; core's is exported for this pipeline alone).

*It now disagrees with the live renderer.* Item 5 moved sample numbering onto the reindexer's index
everywhere except here, so `renderSptBlockToHtml.ts` and its UD/MZ/PS/coring siblings still print `*`
from `recoveryInPercentage === 0`. Left deliberately — the point of a parked fallback is that it is
not touched — but anyone who switches back to `sharePdfLegacyHtml` should know the two differ for a
recovery length that rounds to 0.0 %.

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

*Fixed for new data 2026-09-01.* The codes became granite 810 and schist/phyllite/slate all 812,
confirmed against the legend set.

*Amended 2026-09-02:* schist is **813**, its own hatch; phyllite and slate stay on 812. That value
was set on core's copy in `fbbf41f` and never reached mobile — which, since only mobile's copy has a
runtime consumer, meant the field app kept writing 812. Item 7 collapsed the two copies, so 813 is
now what gets written. Blocks logged before that carry 812 and join the backfill below.

The trap worth recording, because fixing only half of it looks like fixing it: **`rockCode` is written
into the stored payload at data-entry time**, by `RockPropertiesInputQuestions.tsx:30` ->
`getRockCode()` -> `ROCK_TYPE_CODE_MAP` in **`apps/mobile/src/constants/rock.ts`**, and
`@mmsb/ags-excel` reads `block.rockProperties.rockCode` off the payload (`blockFacts.ts:88`), never the
constant. So core's copy has no runtime consumer at all; editing it alone changes nothing. Both copies
now carry the new values — which is item 7's hand-sync debt in miniature.

**The backfill: nothing to do yet, checked 2026-09-02.** No row carries a rock code. All 21 blocks in
the project are types 1, 4, 7, 8, 11 and 13 — **there is not one coring block**, and coring is the only
type with `rockProperties`. `payload::text` does not contain the substring `rockCode` anywhere.

That is a reprieve, not a resolution: the codes are wrong from the first cored borehole onward, and
the first one logged after this will already be right.

**Read this before running it against real data, because the obvious query lies.**
`blocks.payload` is `jsonb`, but its value is a **JSON string, not a JSON object** —
`jsonb_typeof(payload)` is `'string'` for all 21 rows. The client writes `JSON.stringify(block)` into
a `jsonb` column, so Postgres stores one JSON scalar whose text happens to be an object; that is why
`parseUntilObject` loops on the way back in. The consequence: `payload->'rockProperties'` is **NULL
for every row**, so the sizing query an earlier version of this entry gave would report zero and read
as "nothing to fix" whether or not there was.

Decode with `#>> '{}'` on the way in and re-encode with `to_jsonb(...::text)` on the way out. Size it:

```sql
with p as (select id, (payload #>> '{}')::jsonb as obj from blocks)
select obj->'rockProperties'->>'rockType' as rock_type,
       obj->'rockProperties'->>'rockCode' as rock_code,
       count(*)
from p where obj ? 'rockProperties' group by 1, 2 order by 1, 2;
```

Survey both columns, not just the code — the schist pass keys on the type. Then rewrite, one pass at a
time so each is countable and reversible from a backup:

```sql
update blocks
set payload = to_jsonb(
  jsonb_set((payload #>> '{}')::jsonb, '{rockProperties,rockCode}', '810'::jsonb)::text)
where (payload #>> '{}')::jsonb->'rockProperties'->>'rockCode' = '840';
-- then 873 -> 813 and 872 -> 812, the same shape
```

The fourth pass is not a code rewrite. 812 is *correct* for phyllite and slate and wrong only for
schist, so it keys on the type:

```sql
update blocks
set payload = to_jsonb(
  jsonb_set((payload #>> '{}')::jsonb, '{rockProperties,rockCode}', '813'::jsonb)::text)
where (payload #>> '{}')::jsonb->'rockProperties'->>'rockCode' = '812'
  and (payload #>> '{}')::jsonb->'rockProperties'->>'rockType' = 'SCHIST';
```

Verify the rewrite before trusting it — `jsonb_typeof` of the new value must still be `string`, and it
must still decode to an object:

```sql
select jsonb_typeof(payload), jsonb_typeof((payload #>> '{}')::jsonb) from blocks limit 5;
```

Run it while no device is mid-sync: a queued block write carrying the old code would land after the
update and put it back.

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

### 12. Resolved: the rendered PDF is byte-deterministic

`CLAUDE.md` claimed the report's output was deterministic — "creation date and producer are pinned" —
and offered `shasum -a 256` across devices as the acceptance check for "does it look the same
everywhere". Neither was true. `pdfLibBackend.ts` called `PDFDocument.create()` and `pdf.save()`
without touching metadata, so pdf-lib stamped `CreationDate` and `ModDate` with the current time:
two renders of the same fixture seconds apart differed in 234 bytes, all inside one compressed object
stream near the tail, carrying a value of the form `D:20260902103501Z`.

Nothing in the app compares PDF bytes, so what this broke was a human check — the one item 8 names as
the precondition for deleting the ~2,000-line legacy pipeline. It would have reported a mismatch
between two identical reports, which is the worst kind of wrong answer.

*Fixed 2026-09-02.* `renderReportDoc` now sets `CreationDate` and `ModDate` to a fixed
`2000-01-01T00:00:00Z`, and sets `Producer`/`Creator` to `@mmsb/report` so the claim about the
producer is true as well. The date is arbitrary and nothing reads it — a borehole log's own dates are
drawn on the page. Verified across all twelve fixtures: each renders the same hash on every run, and
twelve different hashes, so it is stable rather than constant.

The `render` script's `sha256` line is therefore now a usable check, but it is deliberately **not**
snapshotted the way `pagination` is: it changes on any legitimate layout change, and the pagination
snapshot already covers that with a `--snap` workflow. Its job is comparing one build across devices.

### 13. A photo taken offline could be permanently invisible on every other device

Not latent — this one fired on any photo whose row reached a second device before its bytes did,
which is the normal case rather than the exotic one. **Fixed 2026-09-04, but not yet confirmed on
two devices**; the verification is at the end.

A photo travels by two independent queues. The `block_photos` row goes through PowerSync's CRUD
queue; the JPEG goes straight to Supabase Storage through the attachment queue
(`SupabaseRemoteStorageAdapter.ts` — `supabase.storage.from(bucket)`, never touching the sync
service). `saveFile`'s `updateHook` makes the pair atomic *locally*, and nothing makes them atomic
across the network. The row is a few hundred bytes and the photo is a few megabytes, so the row
wins.

So device B receives a `block_photos` row, queues a download, and gets `Object not found` because
device A is still uploading. The old handler returned `false` for exactly that error — reasonable
against a *deleted* object, and a 404 cannot tell the two apart.

What made it permanent is downstream of that, in `@powersync/common@2.2.0`:

| | |
| --- | --- |
| `SyncingService.js:136-141` | `false` from `onDownloadError` sets state `ARCHIVED` |
| `AttachmentContext.js:41-55` | `getActiveAttachments()` selects `QUEUED_UPLOAD`, `QUEUED_DOWNLOAD`, `QUEUED_DELETE` — **not** `ARCHIVED` |
| `AttachmentQueue.js:168-187` | an `ARCHIVED` record is restored **only** in the `watchAttachments` reconciliation |

The 30-second periodic sync therefore never revisits it. The reconciliation that would restore it
runs only when the watcher emits, and this repo's watcher is `SELECT id FROM block_photos` — so it
emits when that set *changes*. Device A finishing its upload changes nothing in `block_photos`. The
photo is invisible on device B until some unrelated insert or delete happens to re-emit the watch,
which is unbounded and silent. Worse, `deleteArchivedAttachments` prunes archived records past
`archivedCacheLimit` (100), after which the record is gone outright.

Note the failure is one-sided and therefore easy to miss: the device that *took* the photo has the
file locally and shows it correctly forever. Only everyone else sees a block with a missing photo,
and nothing anywhere reports an error.

**The fix** keeps retrying a download 404 while the attachment record is younger than
`DOWNLOAD_NOT_FOUND_GRACE_MS` (24 h), and archives it after. The clock is the record's `timestamp`,
set when the queue first learns of the row — so it measures "how long since we heard this photo
exists", which is the right question. The bound matters: a `block_photos` row whose object never
arrived (a device lost or wiped before its upload queue drained) would otherwise cost a request
every 30 s forever.

**Why 24 hours and not a retry count.** The window has to cover device A regaining signal, not just
the upload itself, and a crew can be off-grid for a shift. A count would expire in minutes.

**To verify, which needs two devices and has not been done:**

1. Put device A in airplane mode. Add a block with a photo.
2. Bring A online and immediately background it, so the row uploads and the JPEG does not finish.
3. On device B, open the borehole. The photo should appear within a sync cycle or two of A's upload
   completing — before the fix it would never appear.
4. `select id, filename, state, timestamp from attachments` on B: state should reach `3` (SYNCED),
   never resting at `4` (ARCHIVED).

**Still open, and the real asymmetry:** the two queues remain independent, so a device can hold an
unuploaded photo indefinitely and nothing surfaces that. There is no UI anywhere for "this photo has
not left the device yet", and `attachments.state` is never read outside the queue. A phone lost
before its upload queue drains takes those photos with it, and the first sign is a blank photo on
the report. Item 0's cascade note is the mirror image of this — bytes with no row; this is a row with
no bytes.

### 14. Adding any dependency today re-resolves the whole native graph

Not a defect — a cost, and one that is invisible until you look at the diff. Recording it because it
turns "add one dev tool" into a decision about the mobile release.

`supports-color@10.2.2` has aged past the freshness gate that `supports-color@8.1.1` was locked
under. It is an optional peer of `@babel/core`, which is a peer of `react-native`, which is a peer of
every native package here. So *any* `pnpm install` that re-resolves — adding a dependency to any
workspace package, not just `apps/mobile` — rewrites the peer hash of the entire chain:

```
-  '@powersync/react-native@2.2.0(...(@babel/core@7.29.7(supports-color@8.1.1))...)'
+  '@powersync/react-native@2.2.0(...(@babel/core@7.29.7(supports-color@10.2.2))...)'
```

**4,888 lines of lockfile diff, and not one package version changes.** What changes is identity:
every `node_modules/.pnpm/<name>@<version>_<peer hash>` directory is renamed, so every symlink under
`apps/mobile/node_modules` repoints. Observed 2026-09-04 when wrangler was briefly added to
`apps/web` — a package `apps/mobile` does not depend on, in an app that does not build for a device.

What it costs:

- **Every open editor reports unresolved imports** until its language server restarts, because it is
  holding a `.pnpm` path that no longer exists. That is the symptom you will actually notice, and it
  looks like a broken import rather than a relink.
- Metro's cache is invalidated.
- Worth checking, not yet checked: whether it perturbs the EAS **fingerprint** runtime version
  (`app.config.ts`). `supports-color` has no native code, so it probably does not — but "probably"
  is doing work there, and a changed fingerprint means existing installs stop accepting OTA updates.

**So do not take this churn incidentally.** Restoring is
`git checkout <ref> -- pnpm-lock.yaml && pnpm install --frozen-lockfile`, which relinks to the
recorded resolution; verify with `readlink apps/mobile/node_modules/@powersync/react-native`.

It should be taken **deliberately**, at a point where a device build will be tested afterwards —
after Phase 3, not during it. `minimumReleaseAgeExclude` in `pnpm-workspace.yaml` is the existing
precedent for pinning through this gate on purpose, and carries the comment explaining why.

Until then, prefer `npx <tool>@<version>` for anything that only ever runs in CI. That is why 2.1's
deploy command names a wrangler version rather than depending on one.

### 15. `expo-doctor` fails on two overrides that Expo has since made redundant

`npx expo-doctor` in `apps/mobile` reports 16/18 (checked 2026-09-05, expo-doctor 1.20.4 against
`expo@~54.0.37`). Neither failure is breakage — both are leftovers that stopped being load-bearing
when SDK 54 learned to do the same thing itself.

**Metro config.** `metro.config.js` replaces `watchFolders` with a single entry, the workspace root.
But `getDefaultConfig` already walks the pnpm workspace and returns every member:

```bash
node -e "const {getDefaultConfig}=require('expo/metro-config');console.log(getDefaultConfig(__dirname).watchFolders)"
# <root>/node_modules, apps/web, apps/mobile,
# packages/{supabase,report,core,ags-excel}
```

Bundling still works — the root is an ancestor of all seven — so the check is what fails, not the
build. Doctor compares the two lists by membership, and one path that happens to contain the others
is not the same set. The `resolver.nodeModulesPaths` override below it is redundant in the stronger
sense: the default is already the identical two paths in the identical order.

So the comment in that file ("Metro must watch the real location or edits to `@mmsb/core` are
invisible") describes a real failure that upstream now prevents. Deleting both assignments should
fix the check and *narrow* what Metro crawls — right now it watches the whole repo, `.git`, the
Python scripts and `packages/ags-excel/out` included.

**`@expo/config-plugins`.** A direct dependency (`~54.0.4`) that nothing imports; `package.json` is
the only file in the repo that names it. It arrived wholesale with `d5ca422 Migrate files to
apps/mobile`, and no local plugin needs it — `app.config.ts` lists only published plugins. `expo`
re-exports the same module as `expo/config-plugins`, which is what doctor is asking for.

*Why it is currently harmless.* Nothing consults doctor's exit code — it is not in CI, not in a
`pnpm` script, and EAS does not gate a build on it. The app bundles and ships today.

*What would make it bite.* Two things. Adding doctor to CI, which is the obvious one. And less
obviously: the metro override is a *silent* divergence, so if Expo ever adds a folder to its
defaults that the workspace root does not cover — a store outside the repo, a linked package — the
override drops it and the failure looks like a missing module, not a config problem.

*Why deferred rather than done.* The fix is a three-line deletion, but it changes what Metro watches
and what `pnpm install` resolves, so it wants a device build afterwards to confirm — the same
timing constraint as item 14. Do both in one pass.

### 16. Three page-break cases a split block still handles poorly

A block whose depth interval crosses a page break is now drawn in parts: as much as fits on the
page, the rest continuing at the top of the next (`paginate.ts`). A part must be at least
`MIN_PART_TICKS` — 3 ticks, 0.3 m, derived in `pageGeometry.ts` as the height of one line of
base-size text — or the whole block moves to the next page instead, because a part shorter than
that cannot print the sample label and blow counts that only ever appear on the first part.

That minimum is enforced in one place only, on the decision to split. Three cases slip past it:

- **A short trailing part.** The rule guards the part on *this* page, not the one on the next. A
  9.1 m block starting with 8.9 m of page left splits 89 + 2 ticks, and the 2-tick continuation is
  below the minimum. It only carries description text, so nothing is lost — but the text is clipped
  to one line and `descriptionClipped` fires. Splitting on the *larger* remainder, or pulling a
  tick back from the first part, would fix it.
- **A folded sample+test pair on a 3-tick part.** Column 1 then holds two lines (`P3` over
  `FHPT1`), needing 14.95 pt against the 13.07 pt a 3-tick part has. The second label clips
  silently — there is no warning for an overflowing `lines` cell, only for the description. Either
  raise the minimum to two lines (5 ticks) when `testBlock !== null`, or warn.
- **A block shorter than the minimum.** A 0.2 m operation can never satisfy it anywhere, so it is
  drawn wherever it lands, including in a 1-tick sliver at the foot of a page. Carrying it forward
  instead would not help and could loop; the `split-tiny-block` fixture pins the current behaviour.

None of these is reachable without a block landing within 0.3 m of a page boundary, which is why
they are recorded rather than fixed: the arithmetic that would fix the first two also changes where
every ordinary block lands, and that wants a real borehole to check against rather than a fixture.

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
- **An in-situ test truncates the stratum it sits inside, on `Geology - AGS`.** *Changed 2026-09-01,
  revised 2026-09-06.* In-situ tests (the three permeability tests, Lugeon, vane shear,
  pressuremeter) get their own Geology row, because `GEOL_DESC` is what the report draws the
  description column from and dropping them lost text a human had entered. A test sits *inside* its
  host block's interval — the PDF folds it onto the host's row via `collapsePairs.ts` — which used
  to make `GEOL_TOP`/`GEOL_BASE` overlap. `buildGeologyRows` now chains every row's base depth to
  the next row's top, so the rows partition the hole again and a downstream thickness sum or
  legend-hatch fill no longer double-counts. What is left is the other side of the same coin: a host
  stratum's row stops where the test starts and resumes as the test's own row, so the host's
  interval is shorter than the interval its description was written for, and the test row carries a
  slice of ground it does not describe. The report reads the rows in order and draws each
  description against its own interval, so it reads correctly; a consumer that wanted the true
  extent of a soil layer would need the test rows filtered out first.
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
- **`fetchBlocksByBoreholeIds` reads only the first page.** PostgREST caps rows per response (1000
  by default) and truncates *silently* — a short page is indistinguishable from the end of the
  table. The project-wide Excel export selects every block of every borehole in one unpaged
  `.in()`, so a project past that cap exports a workbook that is quietly missing blocks, and
  `sortAndReindexAllBlocks` then renumbers what survived, so the sample references come out wrong
  rather than merely incomplete. It bites at roughly 1000 blocks per project — a handful of
  well-logged boreholes. `apps/web/src/supabase/fetchBoreholeStatuses.ts` shows the fix: loop
  `.order('id').range(offset, offset + PAGE_SIZE - 1)` until a short page arrives. Not done here
  because the export additionally deserializes every payload, so paging it deserves a look at
  whether the whole thing should stream.
- ~~**The site plan on web.**~~ *Done 2026-09-01.* The borehole location plan the client supplies as a
  PDF, one per project, behind a "Site Plan" row in the ProjectPage detail card. It is stored with
  **no schema change at all**: the object key is `site-plans/<projects.id>.pdf` in a new `documents`
  bucket, so the project id is *in* the path and nothing in Postgres records that a plan exists.
  `packages/supabase/policies/documents.sql` carries the four policies, and two of its choices are
  worth knowing before changing them. Writes are role-only (`role in (1, 2)`) and deliberately **not**
  assignment-scoped: owners and admins hold no `project_to_user` row, so a project-scoped write
  predicate would deny every upload the feature exists to allow — assignment scoping is meaningful on
  read, where supervisors and viewers reach the policy, and meaningless on write, where they never do.
  And unlike the photo bucket there **is** an UPDATE policy, because reissuing a revised drawing
  overwrites the same key through `upsert: true`, which is an UPDATE rather than an INSERT.
  A second bucket rather than the photo bucket because `is_assigned_to_photo_object()` encodes
  the assumption that every object in that bucket is a block photo.
- **Plotting the boreholes themselves on a map.** Parked, and not for want of a library. `Borehole`
  carries `eastingInMetres` / `northingInMetres`, but **nothing in this repo records which datum
  those metres are in** — no EPSG code, no proj4, no lat/lng anywhere. Google Maps takes lat/lng
  only, so a pin needs a projection conversion, and which conversion depends on an answer nobody has
  written down: GDM2000 / Peninsular Malaysia RSO (EPSG:3375) and the Cassini-Soldner state grids are
  both convertible, but a surveyor's arbitrary site grid with a local origin is **not convertible at
  all** without a control point, and those are common on construction sites. It is also a per-project
  property, not a global one — different clients hand over different grids. So the blocker is a
  question for a human with the survey paperwork, not an implementation task. The site plan above is
  what the field actually asked for, and it sidesteps this entirely by being a document rather than a
  computation. If this is ever picked up, the datum has to become recorded data before any code is
  written.
- **Deleting a borehole or a project on web.** *Built 2026-09-06.* Asked for on the borehole page
  (2026-09-02), deferred on the analysis below, and unblocked four days later by policy work done
  for an unrelated reason.
  Kept here rather than deleted, because the reason it was blocked is the reason the implementation
  looks the way it does.

  *What the deferral said.* Hard delete was permitted at the top — `boreholes` and `projects` both
  carry an owner/admin `for all` — but what it took with it was not. Owners and admins had **no**
  delete on `blocks`, on `block_photos`, or on `storage.objects`, so the child rows could only go by
  FK cascade, which runs as the table owner and **bypasses RLS**, deleting exactly what those
  policies refused the same user directly. And the JPEGs could not go at all: nothing anywhere
  deletes from Storage except a *device* noticing its own `block_photos` row disappear
  (`SupabaseRemoteStorageAdapter.ts`), which never fires for a delete that happened server-side. A
  borehole deleted from the dashboard would have stranded every photo of every one of its blocks in
  the bucket — billed, and unreachable the moment `is_assigned_to_photo_object()` returned NULL for
  them. Item 0's orphan class, at borehole scale, and at project scale one level up.

  *What changed.* The September 2026 addenda — `blocks.sql` "Owners and admins can manage all
  blocks", `block_photos.sql` addendum 1, and addendum 2's `"managers delete photos
  (block-photos)"` on the bucket — gave roles 1 and 2 delete on all three. They were written for a
  different reason (a manager could view photos but not attach or remove them, and a write RLS
  refuses is retried forever by the PowerSync queue), but they retire both halves of this blocker at
  once: the cascade no longer does anything the caller could not do directly, and the bytes are now
  removable by the same session that removes the rows.

  *So the shape is:* collect the photo object keys, delete the row, then remove the objects —
  `apps/web/src/supabase/deleteCascade.ts`. **That order is load-bearing and is not the obvious
  one.** A key is derived from a `block_photos` row and from nothing else, so it has to be read
  before the cascade destroys the row; but purging the bucket *first* would mean that an RLS refusal
  — the likely failure, and a silent one — destroyed every photo of a borehole that still existed.
  Deleting the row first proves the permission before anything irreversible happens to the bytes,
  and the residual failure is orphaned objects, which the query in item 0 finds. `deleteSitePlan`
  runs last for the same reason and is non-fatal: a site plan is an object with no row at all, and
  most projects never have one.

  The three pieces the deferral prescribed were all used: `saveProjectPeople`'s `.delete().select()`
  and row count (an RLS refusal is a silent success, not an error), `EditMemberModal`'s danger zone
  for the confirmation UI with `autoFocus` never on the destructive button, and the entry point on
  the *list* rather than the detail page so the row can be removed in place. Deleting a project asks
  for its code to be typed back; a single borehole does not.

  Soft delete stayed a non-starter, unchanged: `deleted_at` is on every table and nothing writes or
  reads it, `BOREHOLE_COLUMNS` does not select it, and the sync rules live in the PowerSync
  dashboard. It is also the looser of the two on permissions — a soft delete is an UPDATE, and the
  update policy on `boreholes` is assignment-scoped, so any assigned viewer could issue one through
  the API. Item 0d's situation exactly, and it needs the same one-pass fix.

- **A deleted borehole can stall the upload queue on a device that was still working on it.**
  Not fixed, and not fixable from the dashboard — recorded because the delete feature above is what
  makes it reachable.

  A field device holding unsynced local edits to a block of a borehole that has since been deleted
  will, on its next connection, upload a `blocks` upsert whose `borehole_id` no longer exists. That
  is an FK violation. `Connector.ts` deliberately throws rather than calling
  `transaction.complete()` — which is what makes PowerSync retry — so the operation is retried
  forever and **every upload queued behind it on that device stalls with it**. The block sits in the
  local database looking saved, never reaches Supabase, and nothing on the device reports it: the
  failure mode CLAUDE.md describes as looking like data loss, which is what `blocks.sql`'s addendum
  was written to close for a different cause.

  Nothing in the repo detects this, and the dashboard cannot: whether a device has queued work for a
  borehole is not knowable from Postgres. Three things would each help, in increasing order of
  effort — surfacing the CRUD queue depth and its oldest failing operation somewhere in the field
  app so a stall is at least visible; having `Connector.uploadData` discard rather than retry an
  operation that fails with `23503` on a parent that no longer exists (a delete that has already
  won, not a transient error); or making borehole deletion refuse while any device holds unsynced
  work, which needs a signal that does not exist today. Until then: prefer to delete boreholes that
  are finished, and treat deleting one mid-shift as something to coordinate with whoever is on site.
