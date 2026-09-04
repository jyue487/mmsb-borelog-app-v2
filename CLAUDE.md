# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Borehole logging ("borelog") for geotechnical site investigation at MMSB. A field engineer records
what came out of the ground at each depth interval of a borehole, and the app renders that into the
standard A4 borehole log report.

Two clients over one Supabase backend:

- `apps/mobile` — Expo/React Native app used offline in the field. The primary app: data entry + PDF generation.
- `apps/web` — Vite/React dashboard for office use (project/borehole admin). Much newer and thinner.
- `packages/core` — the shared domain: interfaces, constants, and the one block parser both clients
  use. `apps/mobile` and `apps/web` both depend on it; nothing is duplicated any more.
- `packages/report` — the borehole log report: pagination, layout and pdf-lib rendering, shared by
  both apps. Platform-free.
- `packages/ags-excel` — fills the AGS spreadsheet template from borehole data, for the separate
  Python program that renders the professional report from it. Platform-free, like `report`.
- `packages/supabase` — the shared backend: Deno edge functions and RLS policy SQL. **Not** at the
  repo root, which is where the Supabase CLI expects to find it — see the warning below.

## Commands

pnpm workspace + Turborepo. Node 24, pnpm 11.

`pnpm build` from the root works and is fully cached (`@mmsb/core` → `web`; `apps/mobile` has no
build task — it ships via EAS). Per-package:

```bash
# mobile (apps/mobile)
pnpm --filter apps/mobile start        # expo start — needs a dev build, not Expo Go (op-sqlite is native)
pnpm --filter apps/mobile android      # / ios
pnpm --filter apps/mobile check-types  # tsc --noEmit — currently clean, keep it that way
pnpm --filter apps/mobile lint         # expo lint

# web (apps/web)
pnpm --filter web dev                  # vite dev server
pnpm --filter web build                # tsc -b && vite build
pnpm --filter web lint
```

Note the package names are inconsistent: `apps/mobile` (literally, a path), `web`, `@mmsb/core` —
so the `--filter` argument differs in shape per package.

There are no tests in this repo — no test runner is configured in any package.

Native builds go through EAS (`apps/mobile/eas.json`): `development` / `preview` / `production`
profiles, each with a distinct bundle id driven by the `APP_VARIANT` env var in `app.config.ts`.

Env vars are gitignored and must be created locally. `apps/mobile/.env.local` takes the three names
in `apps/mobile/.env.example` (`EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_KEY`,
`EXPO_PUBLIC_POWERSYNC_URL`); `apps/web/.env` takes `VITE_SUPABASE_URL` and
`VITE_SUPABASE_PUBLISHABLE_KEY`.

`.env.local` is for local development only — **cloud builds never read it**. EAS resolves the same
three names from the EAS environment that the build profile selects (`"environment"` in
`eas.json`), so per-environment values belong there (`eas env:list`), under the *same* variable
name. Adding a second name like `EXPO_PUBLIC_POWERSYNC_URL_PRODUCTION` does nothing:
`babel-preset-expo` only substitutes the literal property accesses that appear in the source, and
`Connector.ts` reads exactly one of them.

### Supabase CLI — always go through the package scripts

```bash
pnpm sb <any supabase command>    # e.g. pnpm sb functions list, pnpm sb login
pnpm sb:check                     # type-check the edge functions (Deno)
pnpm sb:deploy                    # check, then deploy both edge functions
```

`sb` is a root `package.json` script that forwards all arguments, so anything in the Supabase docs
works with `supabase` swapped for `pnpm sb`. **Never invoke the CLI any other way.** It locates its
project by looking for a directory named `supabase` inside its working directory; this repo keeps
that at `packages/supabase`, so every command needs `--workdir ..`, which only the `sb` script
passes. `pnpm exec supabase` from the root also just fails — the CLI is a devDependency of
`@mmsb/supabase`, not of the root.

**Running the bare CLI from the repo root fails silently**: it reports success and creates a second,
empty `supabase/` at the root that then shadows the real one. A stray root `supabase/` directory is
the symptom — delete it and use a script. See `packages/supabase/README.md`.

The edge functions are Deno and sit outside every `tsconfig.json`, so neither `pnpm build` nor
`pnpm lint` type-checks them, and `functions deploy` bundles without checking types either — hence
`sb:check`, which `sb:deploy` runs first and stops on. Its `--node-modules-dir=none --no-lock` flags
are load-bearing: without them Deno writes a `workspaces` field into the root `package.json` and
drops a `deno.lock` at the root. See `packages/supabase/README.md`.

## Architecture

### Offline-first sync (mobile)

The field app must work with no signal, so **all mobile reads and writes go to a local SQLite
database and sync in the background** — never call Supabase directly for borelog data.

- `src/powersync/system.ts` — the `powersync` singleton (PowerSyncDatabase over op-sqlite). Every
  `src/db/**` function issues raw SQL against this, not against the network.
- `src/powersync/AppSchema.ts` — local schema. Table names are exported as constants; every table
  carries `created_at/by`, `updated_at/by`, `deleted_at/by`.
- `src/powersync/Connector.ts` — drains the local CRUD queue into Supabase (PUT→upsert,
  PATCH→update, DELETE→delete). It must **not** call `transaction.complete()` on failure; throwing
  is what makes PowerSync retry.
- Sync is started lazily from the project list screen (`src/app/index.tsx`) after sign-in:
  `setupPowerSync()` → `powersync.waitForFirstSync()` → `photoAttachmentQueue.startSync()`.
- Photos ride the PowerSync attachment queue (`src/storage/SupabaseRemoteStorageAdapter.ts`), which
  watches the `block_photos` table and mirrors files into a Supabase Storage bucket. Reading a
  photo means joining `block_photos` to `attachments` for a `local_uri` — see
  `src/db/blockPhotos/fetchAllBlockPhotoUrlsByBlockId.ts`.

Auth is Supabase (`src/db/supabase.ts`, AsyncStorage-backed session). `AuthContextProvider` exposes
`userId`, and `_layout.tsx` gates the whole route stack on it via `Stack.Protected`.

### The Block model — the core abstraction

A borehole is an ordered list of **blocks**, each covering a depth interval. There are 18 block
types (SPT, coring, cavity, UD/MZ/PS undisturbed samples, permeability tests, etc.), enumerated in
`packages/core/src/interfaces/Block.ts` as `*_BLOCK_TYPE_ID` constants plus `BLOCK_TYPE_ID_LIST`.

`Block` is a discriminated union: `BaseBlock & Blocks[K]`, discriminated on `blockTypeId`. Almost
every block carries `topDepthInMetres`, `baseDepthInMetres`, `description`, and a `dayWorkStatus`
(start/end date+time, water level, casing depth — how the log records shift boundaries).

**Storage is a JSON blob, not columns.** The `blocks` table has only `id`, `borehole_id`,
`block_type_id`, `payload` — where `payload` is the whole block JSON-stringified.

**And the column is `jsonb` holding a JSON *string*, not a JSON object** — `jsonb_typeof(payload)` is
`'string'` for every row, because both clients write `JSON.stringify(block)` into it. So
`payload->'anything'` is NULL in every query you will ever write against it: decode with
`payload #>> '{}'` first, and re-encode with `to_jsonb(...::text)` when writing. That is also why
`parseUntilObject` loops rather than calling `JSON.parse` once. `docs/follow-ups.md` item 9 has a
worked backfill.

So:

- `packages/core/src/json/block.ts` is the whole of it, for both clients: `parseBlock(row)` and
  `serializeBlock(block)`. Serializing is `JSON.stringify`; parsing is `JSON.parse` plus the one
  thing it cannot do, which is reviving `Date`s.
- **`reviveDatesInPlace` enumerates every `Date` field across all 18 variants** — root
  `createdAt`/`updatedAt`, the four `dayWorkStatus.*`, and end-of-borehole's nullable
  `installationDate`/`installationTime`. Adding a `Date` field to a block interface means adding it
  there too, or it reads back as a string.
- Nullable timestamps go through `toDate`, never `new Date` — `new Date(null)` is the epoch, which is
  how `docs/follow-ups.md` item 3 happened.
- This used to be 44 hand-written per-type files in `apps/mobile/src/json/**`. They copied every field
  by name, so *forgetting* one dropped it silently on read; that is why they are gone.

### Block ordering and indices

Blocks have no stored sort order or sequence number. After every fetch and every mutation the list
is recomputed in memory by `sortAndReindexAllBlocks()`:

1. `sortBlocks` — sort by `topDepthInMetres`, then by `id`. The id tiebreak is load-bearing: ties on
   depth are normal (a permeability test starts inside its host SPT), `Array.prototype.sort` is
   stable, and without a second key a tie inherits the transport's order — which neither Postgres nor
   an unindexed PowerSync view promises. Both clients must use the same pair or their numbering
   diverges.
2. `reindexAllBlocks` — for each block type, walk the sorted list and renumber that type's own
   counter (`sptIndex`, `disturbedSampleIndex`, `coringIndex`, …) from 1. `reindexBlock.ts` holds a
   `Record<BlockTypeId, fn>` table; types with no counter map to identity.

Consequence: inserting a block at 3.5 m renumbers everything below it. Screens hold `blocks` in
`useState` and pass `setBlocks` down; the reindexed array is the source of truth for rendering.

### Adding or changing a block type

A block type is deliberately fanned out across parallel directories, all keyed by the same
`*_BLOCK_TYPE_ID` constant. Adding one means touching every switch/record below, and TypeScript's
exhaustive `Record<BlockTypeId, …>` will point you at most of them:

| Concern | Location |
| --- | --- |
| Type + `createDefault*` | `packages/core/src/interfaces/<Type>Block.ts`, registered in `Blocks` in `Block.ts`, exported from `src/index.ts` |
| Persistence | nothing, unless the type has a `Date` field — then `reviveDatesInPlace` in `packages/core/src/json/block.ts` |
| Form → validated block | `src/utils/block/checkFunctions/checkAndReturn<Type>Block.ts` |
| Renumbering | `src/utils/block/reindexBlocksFunctions/reindex<Type>Blocks.ts` |
| Read-only display | `src/components/blockComponents/<Type>BlockComponent.tsx` |
| Entry form | `src/components/blockDetailsInputForms/<group>/<type>/…` |
| PDF row | one entry in `BLOCK_ROW_SPECS` in `packages/report/src/rows/blockRowSpec.ts` |

`checkAndReturn*` is the validation convention throughout: input forms keep every field as a
`string` in state, and the check function parses/validates and either throws or returns a fully
typed `Block` with a fresh `randomUUID()`. Forms expose it upward via `setCheckAndReturnBlock`, so
the parent `BlockDetailsInputForm` decides when to run it.

Input forms are grouped by *operation type* for the UI (SPT / Coring & Cavity / Undisturbed Sample /
Required In-situ Tests / End of Borehole / Others). The mapping lives in
`BLOCK_TYPE_ID_TO_OPERATION_TYPE` in `BlockDetailsInputForm.tsx`.

### PDF generation

The report lives in `packages/report` and is **drawn directly with pdf-lib**, not rendered through
a browser. Both apps call one function, `renderBorelogPdf(input, assets)`, so the field app and the
dashboard produce byte-identical output. There is no WebView and no `expo-print` in the path.

The package is strictly platform-free — no `expo-*`, no `react-native`, no DOM, no `fs`, no
`fetch`. Hosts hand in asset bytes (`apps/mobile/src/utils/pdf/loadReportAssets.ts`,
`apps/web/src/utils/downloadBorelogPdf.ts`) and get bytes back. That is what makes the whole layout
runnable and testable in Node with no device and no PDF.

Two tiers, and the seam between them is the point:

- **`ReportInput` → `ReportDoc`** (`src/layout`, `src/rows`, `src/build`) decides *what* goes where.
  `ReportDoc` is plain JSON — a list of `DrawNode`s with resolved coordinates.
- **`ReportDoc` → PDF** (`src/render/pdfLibBackend.ts`) is the only pdf-lib-aware code.

Layout is driven by a **depth scale in ticks: 1 tick = 0.1 m, 90 ticks = one A4 page (9 m)**.
`paginate()` is pure: it returns where every block lands rather than threading a mutable counter
through the renderers, so a block can be measured without being drawn. It special-cases blocks that
overlap — a permeability test starting inside an SPT interval folds onto the sample's own row
(`collapsePairs.ts`).

Two things are load-bearing and easy to break:

- **The tick pitch is derived**, `bodyHeightPt / 90` (`layout/pageGeometry.ts`). Never hardcode it —
  the predecessor measured the ruler in `px` while the page box was in `mm`, and they drifted.
- **Column geometry is per-row.** Rows are 14 columns wide, but coring/cavity/Lugeon rows merge
  columns 5-10 into three double-width cells, so interior vertical rules must come from the row,
  not the table. `assertRowOccupancy()` enforces the 14-column tiling.

Description text is fitted with **real font metrics** (`text/fitTextToBox.ts` binary-searches a size
ladder against `widthOfTextAtSize`). The fonts are pre-subsetted offline by
`scripts/subsetFonts.sh` and embedded with `subset: false`, because pdf-lib's runtime subsetter
mis-maps glyphs for NotoSans. `<i>` in a description is semantic — it marks an in-situ test — which
is why a third (italic) face is embedded.

There is no test runner. Verification is by committed snapshot and differential check:

```bash
pnpm --filter @mmsb/report pagination   # where every block lands, vs a committed snapshot
pnpm --filter @mmsb/report oracle       # diff against a transliteration of the old HTML loop
pnpm --filter @mmsb/report rows         # every block type, asserting 14-column occupancy
pnpm --filter @mmsb/report text         # the size-fitting kernel against real metrics
pnpm --filter @mmsb/report render [fx]  # a real PDF from a fixture
```

Output is deterministic — `renderReportDoc` pins `CreationDate`, `ModDate`, `Producer` and `Creator`,
which pdf-lib otherwise stamps with the current time — so the acceptance check for "does it look the
same everywhere" is `shasum -a 256` across devices, not visual inspection. Do not remove those four
lines; without them two identical reports hash differently and the check silently becomes noise
(`docs/follow-ups.md` item 12).

**The old HTML + `expo-print` pipeline is still present but not referenced**, kept as a fallback
until the new renderer has been validated against real boreholes: 29 `render*ToHtml.ts` files plus
`generateBorelogPdf{Android,Ios}.ts` and `generatePdfPages.ts` under `src/utils/pdf/`, entered via
`sharePdfLegacyHtml.ts`. To switch back, import `sharePdfLegacyHtml` instead of `sharePdf` in
`borehole/[id].tsx` (it returns void, so drop the `warnings` handling). Delete the whole set —
and `expo-print`, and `src/constants/textSize.ts` — once the new path is proven.

### Excel export (AGS)

`packages/report` is not the only renderer of a borelog. A separate Python program — currently in
its own repo, `github.com/jyue487/mmsb_excel2borelog` — reads a filled **AGS workbook** and draws
the professional report with reportlab. `packages/ags-excel` fills that workbook from Supabase data
so nobody has to type it in.

The template is `apps/web/public/ags/template.xlsx` (2.4 MB, committed — note the `!` negation in
`.gitignore`, which otherwise excludes every `*.xlsx`). It is the Keynetix AGS workbook: eleven
sheets, and **its worksheet formulas are the program**. There are 120,310 shared formulas on the SPT
sheet alone, turning a typed grid into hidden AGS `GROUP`/`HEADING`/`UNIT`/`DATA` rows. It is
`.xlsx`, not `.xlsm` — there is no VBA anywhere in it.

So a copy is **patched, never regenerated**:

- `src/xlsx/patchWorkbook.ts` unzips, rewrites only the worksheet parts it injects into, and copies
  every other zip entry through byte for byte. An ExcelJS-style round trip would re-serialise all
  those formulas plus data validation, VML comment drawings and seven `printerSettings` blobs, and
  silently drop whatever it does not model.
- `src/xlsx/cells.ts` splices values into cells that **already exist** — the template pre-declares
  every input cell as an empty styled `<c r="B7" s="54"/>` on every usable row, so nothing is
  inserted in column order and no style is invented.

**The one thing that will break it if forgotten.** The Python side loads with
`openpyxl.load_workbook(data_only=True)`, and openpyxl never evaluates a formula — it returns the
`<v>` Excel last cached. The blank template's caches are stale: SPT's "Reported Result" caches the
literal string `0 (,)`. So the exporter writes correct caches *beside* the untouched `<f>` for every
formula cell the report reads — column A (`PROJ_ID`) on each sheet, and SPT's S and T.
`src/map/sptResult.ts` reproduces that formula chain in TypeScript. Change a blow-count rule there
and the workbook lies until someone opens it in Excel.

Two data-format rules that are easy to get wrong, both taken from real workbooks: **percentages are
stored as fractions** (0.9, not 90 — the cells are percent-formatted), and **dates are Excel serials
while times are bare integers** (`46037` in a date-styled cell, but `900` and `1730` as plain
numbers).

Rows must be **contiguous from each sheet's first data row**, because every sheet stops its own AGS
output at the first blank row (`A6 = IF(AND(B6="",C6=""),"STOP",$A$7)`) and the Python parsers stop
the same way. The first data row is 7 on SPT and 6 everywhere else; `src/xlsx/sheetLayout.ts` holds
that and the row caps, and throws rather than truncating.

Eight of the eleven sheets are filled: Project, Holes, Progress, SPT, Geology, Samples, Core and
Water Strike. Two things about that set are not obvious. `Water Strike - AGS` has no source of its
own — nothing in the data model records a strike as an event — so it is *derived* from the Progress
rows, taking the shift boundaries that recorded a numeric water level and dropping the `NIL`/`FULL`
ones. And `Geology - AGS` deliberately contains **overlapping** intervals: an in-situ test gets its
own row even though it sits inside its host block's interval, because `GEOL_DESC` is where the
report reads the description column from. Detail Description and Backfill are still unfilled.

Like `@mmsb/report`, the package is strictly platform-free — and here the compiler enforces it:
`tsconfig.json` (what `build` uses, covering `src` alone) has no node types, so an
`import 'node:fs'` in the package is a compile error. `tsconfig.check.json` adds them for the dev
scripts and fixtures only.

```bash
pnpm --filter @mmsb/ags-excel fill          # fixture -> out/fixture.xlsx
pnpm --filter @mmsb/ags-excel check-types   # src + fixtures + scripts
python3 packages/ags-excel/scripts/verify.py     # read it back the way the report does
python3 packages/ags-excel/scripts/integrity.py  # only intended parts changed; formulas intact
```

`integrity.py` is the check that matters: it fails if any zip entry outside the eight patched
sheets differs, or if a formula count changes.

### Web dashboard

Plain Vite + React 19 (React Compiler enabled) + Tailwind v4 + react-router. No PowerSync — it
queries Supabase directly via `src/supabase/supabase.server.ts` and maps snake_case rows onto the
`@mmsb/core` types by hand. Routes are declared inline in `src/app/main.tsx`; everything except
`/login` sits behind `ProtectedRoute`, which reads the same `AuthContextProvider` shape as mobile.
`AddBulkBoreholesModal` accepts tab- or comma-separated paste from Excel.

## Conventions

- `@/*` in `apps/mobile` maps to the app root, so imports look like `@/src/db/blocks/...` (note the
  `src` segment) and `@/assets/...`. The domain types and constants are **not** under that alias —
  they come from `@mmsb/core`. Web uses relative imports, plus `@mmsb/*` for the packages.
- `snake_case` in SQL/Supabase, `camelCase` in TypeScript. The translation happens in `src/db/**`
  (mobile) or inline in the page component (web) — there is no shared mapper.
- IDs are client-generated `randomUUID()` from `expo-crypto`, never DB sequences — required for
  offline creation.
- `throwError()` (`src/utils/error/throwError.ts`) is used as a `never`-returning expression in
  switch defaults to keep exhaustiveness checking.

## Rough edges to know about

- **`@mmsb/core` has no subpath exports**, so `@mmsb/core/interfaces/Block` fails to resolve — in
  Metro (package exports are on by default) *and* in tsc (`resolvePackageJsonExports`, inherited from
  `expo/tsconfig.base`). Anything a client needs must be exported from `packages/core/src/index.ts`.
  Core ships **raw TypeScript**: `main`/`types`/`exports` all point at `./src/index.ts`, and the
  `dist/` on disk is gitignored and resolved by nothing. Metro transpiles it because
  `apps/mobile/metro.config.js` puts the workspace root in `watchFolders`. Do not "fix" any of that
  by pointing `main` at `dist/` — EAS runs no build step before bundling.
  `apps/mobile/src/interfaces/` still holds two files that must stay there: `Project.ts`, which
  deliberately omits core's `terminationCriteria`, and the dead `Migration.ts`, which imports
  `expo-sqlite`. `docs/follow-ups.md` item 7 has the rest.
- **`packages/core` is compiled by `@mmsb/ags-excel` under `lib: ["ES2020"]` with no node and no DOM
  types**, so `console` and `new Error(msg, { cause })` are both out of scope inside core. Core's own
  tsconfig inherits nothing and will not catch either — `pnpm build` will.
- `src/db/db.ts`, `src/db/initDb.ts`, `src/db/runMigrationsAsync.ts` and `src/db/migrations/**` are
  **dead code** from the pre-PowerSync `expo-sqlite` era. Nothing imports them. PowerSync owns the
  schema now (`AppSchema.ts`) — do not add migrations there.
- `src/utils/excel/shareExcel.ts` is dead — the file is commented out end to end, and the
  commented-out button that called it is gone from `borehole/[id].tsx`. Nothing references it.
- `src/utils/pdf/` holds two pipelines: the live `sharePdf.ts` → `@mmsb/report`, and the parked
  legacy HTML one behind `sharePdfLegacyHtml.ts`. Only the first is referenced.
- Further deferred defects and debt — most of them latent, with the trigger that would make each one
  bite — are recorded in `docs/follow-ups.md`.
