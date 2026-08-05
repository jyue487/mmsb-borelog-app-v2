# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Borehole logging ("borelog") for geotechnical site investigation at MMSB. A field engineer records
what came out of the ground at each depth interval of a borehole, and the app renders that into the
standard A4 borehole log report.

Two clients over one Supabase backend:

- `apps/mobile` — Expo/React Native app used offline in the field. The primary app: data entry + PDF generation.
- `apps/web` — Vite/React dashboard for office use (project/borehole admin). Much newer and thinner.
- `packages/core` — shared TypeScript types. Only partially migrated (see Rough edges).

## Commands

pnpm workspace + Turborepo. Node 24, pnpm 11.

**The root turbo scripts (`pnpm build`, `pnpm dev`, `pnpm lint`) currently fail** — turbo aborts with
`Could not resolve workspace: Missing devEngines.packageManager or legacy packageManager field`
because root `package.json` has an empty `devEngines: {}`. Adding `"packageManager": "pnpm@11.18.0"`
fixes it. Until then, run per-package:

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

There are no tests in this repo — no test runner is configured in any package.

Native builds go through EAS (`apps/mobile/eas.json`): `development` / `preview` / `production`
profiles, each with a distinct bundle id driven by the `APP_VARIANT` env var in `app.config.ts`.

Env vars are gitignored and must be created locally: `apps/mobile/.env.local`
(`EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_KEY`), `apps/web/.env`
(`VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`).

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
`src/interfaces/Block.ts` as `*_BLOCK_TYPE_ID` constants plus `BLOCK_TYPE_ID_LIST`.

`Block` is a discriminated union: `BaseBlock & Blocks[K]`, discriminated on `blockTypeId`. Almost
every block carries `topDepthInMetres`, `baseDepthInMetres`, `description`, and a `dayWorkStatus`
(start/end date+time, water level, casing depth — how the log records shift boundaries).

**Storage is a JSON blob, not columns.** The `blocks` table has only `id`, `borehole_id`,
`block_type_id`, `payload` — where `payload` is the whole block JSON-stringified. So:

- `src/json/serializeBlock.ts` / `deserializeBlock.ts` are switch dispatchers over `blockTypeId`
  into a per-type module under `src/json/<blockType>/`.
- Deserialization is explicit field-by-field (not `JSON.parse` cast) because `Date` fields have to
  be revived — see `deserializeDateTime`, `deserializeDayWorkStatus`, `deserializeSoilProperties`.
- Changing a block interface means updating its serializer *and* deserializer, or fields silently
  vanish on read.

### Block ordering and indices

Blocks have no stored sort order or sequence number. After every fetch and every mutation the list
is recomputed in memory by `sortAndReindexAllBlocks()`:

1. `sortBlocks` — sort by `topDepthInMetres`.
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
| Type + `createDefault*` | `src/interfaces/<Type>Block.ts`, registered in `Blocks` in `Block.ts` |
| Persistence | `src/json/<type>/serialize*.ts` + `deserialize*.ts`, wired into the two dispatchers |
| Form → validated block | `src/utils/block/checkFunctions/checkAndReturn<Type>Block.ts` |
| Renumbering | `src/utils/block/reindexBlocksFunctions/reindex<Type>Blocks.ts` |
| Read-only display | `src/components/blockComponents/<Type>BlockComponent.tsx` |
| Entry form | `src/components/blockDetailsInputForms/<group>/<type>/…` |
| PDF row | `src/utils/pdf/render<Type>BlockToHtml.ts`, dispatched in `generatePdfPages.ts` |

`checkAndReturn*` is the validation convention throughout: input forms keep every field as a
`string` in state, and the check function parses/validates and either throws or returns a fully
typed `Block` with a fresh `randomUUID()`. Forms expose it upward via `setCheckAndReturnBlock`, so
the parent `BlockDetailsInputForm` decides when to run it.

Input forms are grouped by *operation type* for the UI (SPT / Coring & Cavity / Undisturbed Sample /
Required In-situ Tests / End of Borehole / Others). The mapping lives in
`BLOCK_TYPE_ID_TO_OPERATION_TYPE` in `BlockDetailsInputForm.tsx`.

### PDF generation

The report is produced as an HTML string and handed to `expo-print`. `sharePdf()` picks
`generateBorelogPdf{Android,Ios}` — two separate near-duplicate generators because the platforms'
print engines disagree on layout; a fix to one usually needs mirroring in the other. Fonts and the
MMSB logo are inlined as base64 data URIs so the print engine has no external fetches.

Layout is driven by a **depth scale in ticks: 1 tick = 0.1 m, 90 ticks = one A4 page (9 m)**.
`generatePdfPages.ts` threads a mutable `scaleTickIndexWrapper: number[]` (a one-element array used
as an out-param) through every renderer so each block knows how many ticks it may consume before
the page break at `pageIndex * 90`. It also special-cases blocks that overlap — e.g. a permeability
test starting inside an SPT interval renders as a combined row.

### Web dashboard

Plain Vite + React 19 (React Compiler enabled) + Tailwind v4 + react-router. No PowerSync — it
queries Supabase directly via `src/supabase/supabase.server.ts` and maps snake_case rows onto the
`@mmsb/core` types by hand. Routes are declared inline in `src/app/main.tsx`; everything except
`/login` sits behind `ProtectedRoute`, which reads the same `AuthContextProvider` shape as mobile.
`AddBulkBoreholesModal` accepts tab- or comma-separated paste from Excel.

## Conventions

- `@/*` in `apps/mobile` maps to the app root, so imports look like `@/src/interfaces/Block`
  (note the `src` segment) and `@/assets/...`. Web uses relative imports only.
- `snake_case` in SQL/Supabase, `camelCase` in TypeScript. The translation happens in `src/db/**`
  (mobile) or inline in the page component (web) — there is no shared mapper.
- IDs are client-generated `randomUUID()` from `expo-crypto`, never DB sequences — required for
  offline creation.
- `throwError()` (`src/utils/error/throwError.ts`) is used as a `never`-returning expression in
  switch defaults to keep exhaustiveness checking.

## Rough edges to know about

- **`packages/core` does not compile.** Its `interfaces/` and `constants/` are a copy-paste of the
  mobile tree that still imports `@/src/...` and `react-native`, which don't resolve there. Only
  `Project.ts` and `Borehole.ts` are exported from `src/index.ts`, and only the web app consumes it.
  Mobile still uses its own `apps/mobile/src/interfaces/**` — the two copies must be kept in sync by
  hand. Don't run `tsc` in `packages/core` expecting green.
- **`apps/web build` is currently red** on two `noUnusedLocals` errors (`BoreholePage.tsx`,
  `context/AuthContextProvider.tsx`).
- **`apps/web/index.html` is gitignored** — root `.gitignore` has a blanket `*.html` (intended for
  the `demo*.html` scratch files in `apps/mobile`). The Vite entry point is therefore not in the
  repo; a fresh clone won't build until it's restored or the ignore rule is narrowed.
- `turbo.json`'s `build.outputs` is still the Next.js default (`.next/**`); nothing here emits
  `.next`, so web's `dist` is never cached.
- `src/db/db.ts`, `src/db/initDb.ts`, `src/db/runMigrationsAsync.ts` and `src/db/migrations/**` are
  **dead code** from the pre-PowerSync `expo-sqlite` era. Nothing imports them. PowerSync owns the
  schema now (`AppSchema.ts`) — do not add migrations there.
- `src/utils/excel/shareExcel.ts` and the Excel/PDF buttons in `borehole/[id].tsx` are commented out.
