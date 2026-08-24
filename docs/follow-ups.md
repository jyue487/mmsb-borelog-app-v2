# Follow-ups

Deferred work, triaged out of the review of the web borehole log page (August 2026). Each entry says
what is wrong, **why it is currently harmless**, and what would make it bite — because most of these
are latent, and knowing the trigger is the point.

Nothing here is a live user-facing bug. That is deliberate: live bugs get fixed, not filed.

## Known defects and debt

### 0. Boreholes created from the dashboard are orphaned — **highest priority**

Access to projects, boreholes and blocks is scoped to `borehole_to_user` assignment, deliberately: a
user sees the work assigned to them and nothing else. All four `blocks` policies use

```sql
exists (select 1 from borehole_to_user bu
        where bu.borehole_id = blocks.borehole_id and bu.user_id = auth.uid())
```

The only code that ever creates an assignment row is
`apps/mobile/src/db/borehole/addBoreholeDbAsync.ts:63-68`, in the same transaction as the borehole.
`apps/web/src/components/AddBulkBoreholesModal.tsx:181-183` inserts into `boreholes` only — no
assignment row, and no `created_by` either.

So a dashboard-created borehole has **zero** assignment rows and nobody satisfies the predicate for it,
including the person who created it. Because the same predicate gates insert/update/delete, that stops
**writes** as well as reads: mobile's reads bypass RLS via PowerSync, but the Connector uploads with the
user's session, so a block insert against such a borehole is denied. `Connector.ts` rethrows instead of
calling `transaction.complete()` — which is what makes PowerSync retry — so it retries indefinitely and
the data stays on the device.

*Still to verify:* whether PowerSync's sync rules (configured in the PowerSync dashboard, not this repo)
deliver an unassigned borehole to a device at all. If they don't, nothing gets stuck — but the
Add Boreholes button then produces boreholes no field engineer can use. Either way the bulk-add path
needs an assignment.

*Measured 2026-08-20:* an owner added boreholes from the dashboard and they survived a hard reload. So
`boreholes` is **not** gated by `borehole_to_user` the way `blocks` is — at minimum there is an owner
bypass, of the kind `user_to_role` already carries
(`using (get_current_user_role() = 1)`). The two tables therefore disagree: you can list a borehole
whose log you cannot read.

That makes the read side a *consistency* problem rather than a data-loss one, and it has a UI cost —
see item 0c.

The **write** side is unaffected by any owner bypass and remains the serious part: with no assignment
row, the `blocks` insert policy denies everyone, so a field engineer cannot log against a
dashboard-created borehole at all.

**Do not fix this by writing `borehole_to_user` rows from the web.** The intended direction is to drop
`borehole_to_user` entirely and scope on a `project_to_user` table instead — see "Planned: assignment
moves to the project" below. Under that model this whole class of bug disappears, because a borehole
inherits access from its project and needs no per-row grant. Building an assignment UI for
`borehole_to_user`, or teaching `AddBulkBoreholesModal` to populate it, is investment in a table that is
being removed.

If the Add Boreholes button is needed before that migration lands, the least-bad stopgap is to have the
modal assign the creating user the way `addBoreholeDbAsync` does — accepting that those rows are
throwaway and that it puts office staff in a table meaning "who is drilling this". Otherwise, hold off
using the button until the migration.

See `packages/supabase/policies/blocks.sql` for the deployed predicate.

### 0c. `BoreholePage` reports "no data" when it means "no permission"

`apps/web/src/app/BoreholePage.tsx` renders *"No blocks logged — Nothing has been recorded for this
borehole yet"* whenever the blocks query returns an empty array. RLS returns an empty array rather than
an error, so a user who can list a borehole but is not assigned to it gets that message and goes looking
for missing field data.

Item 0 establishes this is reachable: `boreholes` admits an owner to boreholes that `blocks` will not.

The page should tell the two apart rather than guess — for example by checking assignment explicitly
when the result is empty, and showing a permission message instead. Worth doing whichever way the
consistency question in item 0 is settled, since the same gap reappears any time the predicates on the
two tables drift.

### 0b. Planned: assignment moves from borehole to project

`borehole_to_user` is to be dropped in favour of a `project_to_user` table, so a user is assigned to a
*project* and sees every borehole and block within it. `project_to_user` does not exist yet; the current
schema (`apps/mobile/src/powersync/AppSchema.ts`) has only `borehole_to_user`.

Anything that touches assignment should be planned against that end state rather than the current one.
Known consequences when it happens:

- The `blocks` policies — all four — need their predicate rewritten, as do the equivalents on `projects`
  and `boreholes`. `packages/supabase/policies/blocks.sql` records the current ones and will need
  updating in the same pass.
- PowerSync's sync rules key off the same assignment concept and live in the PowerSync dashboard, not
  this repo. They have to move in step, or the field app and the backend will disagree about who can see
  what.
- `addBoreholeDbAsync.ts:63-68` writes the assignment row on mobile and should stop doing so.
- `packages/supabase/README.md` documents `borehole_to_user.user_id -> CASCADE` in its foreign-key
  notes; that section needs revisiting.

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

`apps/web/src/app/ProjectPage.tsx:119` and `apps/web/src/app/BoreholePage.tsx:73` both select
`verifier_sign_date` and then discard it, assigning `null` to the mapped `Borehole`. Left as-is
deliberately — changing it would silently alter behaviour — but one of the two is wrong: either the
column should be mapped, or it should stop being selected.

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

### 6. `ProjectPage` shows fabricated data

`apps/web/src/app/ProjectPage.tsx:168` derives completion from `Math.round(boreholes.length * 0.7)`, and
the team list at line 160 is five hardcoded names. Placeholder pending a real way to classify a borehole
as complete. Worth removing or labelling before anyone reads the dashboard as reporting.

The borehole log page deliberately has no status badge rather than invent a second fake one.

### 7. `packages/core` is still duplicated into `apps/mobile`

Core now exports the block domain (interfaces, `*_BLOCK_TYPE_ID` constants, `DayWorkStatus`, symbols) and
the web app consumes it. `apps/mobile` still keeps its own hand-synced copy of all of that **and** the 18
per-type deserializers under `src/json/**`.

Finishing it means adding a `metro.config.js` and a `@mmsb/core` dependency to mobile so Metro will
resolve and transpile the workspace package — real risk to the dev and EAS builds, which is why it was
kept out of the web work. See the fuller note in `CLAUDE.md` under "Rough edges to know about".

## Deferred features

- **Editing blocks on web.** The log is read-only. This is also the point at which the dashboard would
  need write access to `blocks`, which is a product decision rather than plumbing.
- **PDF generation on web.** Where page-flipping becomes relevant again: the report is genuinely
  paginated at 90 ticks = 9 m per A4 page, and that tick arithmetic currently lives only in the mobile
  generator's `scaleTickIndexWrapper` threading.
- **Block photos on web.** Needs a policy on `block_photos` *and* a separate policy on the Storage
  bucket — they are two systems, and granting one does not grant the other. Note that mobile's log view
  does not render photos either; they only appear in the camera component.
