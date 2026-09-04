# Launch checklist

Taking both apps to production for the first time (September 2026): `apps/mobile` to Google Play as
a closed testing track for company staff, and `apps/web` to a public URL.

**The ordering is the content.** An Android App Bundle is immutable once uploaded, so a handful of
these items become unfixable-without-a-new-store-release the moment the first production build
ships. Each entry therefore says *why it sits where it does* and *what breaks if it is skipped*, not
just what to do. Work top to bottom.

Three findings shaped the sequence, and none of them was the obvious answer:

- **This is not an update. It is a replacement.** The app currently on the crews' phones is commit
  `507f66d`, 2025-10-14 — eight months older than any Supabase or PowerSync code in this repo
  (PowerSync first appears 2026-06-25, auth 2026-06-24). It is local-only `expo-sqlite` with no
  login. The new app is a different data architecture, and Phase 3 is about that transition rather
  than about a version bump. It now ships under its own package id so the two coexist.
- **A Play auto-update does not wipe local data — and that is not the reassurance it sounds like.**
  An update over the same package id and signing key leaves the data directory intact, so the old
  `mmsb.db` physically survives. But nothing in the new codebase opens it, so it is orphaned rather
  than migrated. See Phase 3.
- **Promote the current Supabase project to production; build the fresh one for development.** The
  intuitive direction is to stand up a new production project and migrate into it. That is strictly
  worse: it requires a data migration *and* it repoints every device at a new backend, which is the
  one thing that genuinely presents to a user as data loss.

## Phase 0 — before any production build

Everything here is grouped first for one reason: each item is compiled into the bundle, and the
bundle cannot be changed after upload.

### 0.1 Make the PowerSync endpoint an environment variable — **done**

The instance URL was hardcoded at `apps/mobile/src/powersync/Connector.ts:21`. It now comes from
`EXPO_PUBLIC_POWERSYNC_URL`, with a guard in `fetchCredentials` that throws a named error if the
variable is missing.

**Why it was item one:** nothing in Phase 1 is possible until it lands. With the URL baked in, the
development build and the production build talk to the *same* sync service no matter which Supabase
project they authenticate against — there is no separate-environments story at all.

What landed alongside it:

- `apps/mobile/.env.example`, listing the three variables with no values. Root `.gitignore` needed
  `!.env.example` to make it committable — the existing `*.env*` pattern matched the template too,
  so without the negation the file would have been silently untracked forever.
- `"environment"` on all three build profiles in `apps/mobile/eas.json`, so each profile explicitly
  selects its variable set rather than relying on name-matching.
- All three variables created in all three EAS environments (see 0.4 — this turned out to be the
  load-bearing part).

**How EAS actually models this, learned the hard way on 2026-09-04.** "Created in all three
environments" is one variable *linked to* three environments, not three variables — `eas env:list
--format long` shows a single id per name with `Environments  development, preview, production`. So
they share one value, and `eas env:update --variable-environment production` edits **all three**. It
reports success naming only the project, which is easy to read as having done what you asked.

Diverging one environment therefore means splitting the variable, not editing it:

```bash
# 1. narrow the existing variable to production, keeping its new value
pnpm exec eas env:update --variable-name X --variable-environment production \
  --environment production --non-interactive
# 2. recreate it for the others (the name is then free in those environments)
pnpm exec eas env:create --name X --value <other value> \
  --environment development --environment preview \
  --visibility plaintext --scope project --non-interactive
```

Done for `EXPO_PUBLIC_POWERSYNC_URL` when the Production instance was activated. The two Supabase
variables are still single objects shared by all three environments, and will need the same split
the moment 1.2's development project exists — that is the step to expect, not a second `env:update`.

**One thing the literal expression depends on:** `babel-preset-expo` inlines `EXPO_PUBLIC_*` by
static text substitution at build time. `process.env[someKey]` and
`const { EXPO_PUBLIC_POWERSYNC_URL } = process.env` are *not* substituted and silently yield
`undefined`. The full property access has to be written out.

Note also that `EXPO_PUBLIC_` values are readable in the shipped bundle. Correct here — the URL is
an address, not a credential; auth is the Supabase JWT passed as `token`. Never put a real secret
behind that prefix.

### 0.2 Add EAS Update (`expo-updates`) — **done**

`expo-updates@~29.0.20` is installed, and configured as:

- `runtimeVersion: { policy: "fingerprint" }` in `app.config.ts`
- `updates.url` pointing at `https://u.expo.dev/<projectId>`, with
  `fallbackToCacheTimeout: 0`
- `channel` on each of the three build profiles in `eas.json`, matching the profile name

**Why here:** this is the only escape hatch. Without it, every change — a typo in a label, a crash
in the PDF renderer — needs a full AAB rebuild, upload and Play review. For an app used by crews on
site, that is days of turnaround on a one-line fix.

**Why `fingerprint` and not `appVersion`.** The runtime version decides which binaries an update is
allowed to land on. `appVersion` ties it to the version string, so forgetting to bump that string
after adding a native dependency lets you push a JS bundle onto a binary that cannot run it — a
crash-on-launch you would then have to fix through the store, having lost the OTA channel that was
supposed to save you. `fingerprint` hashes the native project instead, so it changes on its own
whenever the native surface does and that mistake becomes unrepresentable.

**Why `fallbackToCacheTimeout: 0`.** It stops the launch sequence ever waiting on a network check.
Crews open this app underground and on sites with no signal; it must start instantly from the cached
bundle and fetch any update in the background, applying it on the next cold start. That also means
an update never interrupts a session in progress, which is the behaviour you want when someone is
part-way through a borehole.

Publishing an update, once a build with a matching fingerprint is out:

```bash
npx eas update --channel production --message "what changed"
```

**Why before launch specifically, and not later:** `expo-updates` is a native module. Adding it
after the fact means the already-installed production app cannot receive updates, so enabling the
mechanism would itself cost a store release. Install it now and the very first production build is
patchable.

**The limit worth knowing:** OTA updates carry JS and assets only. Native changes — a new native
dependency, a plugin change in `app.config.ts` — still need a store build, and `runtimeVersion` is
what enforces that boundary correctly rather than shipping a JS bundle to an incompatible binary.

**What this is not.** It is tempting to reach for `expo-updates` to control *when* each crew member
moves onto the new app. It cannot do that, because Play's auto-update of the whole binary is a
separate mechanism running on Play's schedule regardless. Omitting `expo-updates` does not withhold
updates from anyone — it only removes your ability to ship a fix in minutes and to roll back.
Controlling who moves when is a packaging decision, handled structurally in 3.1.

### 0.3 Decide the version string — **done**

Set to `2.0.0` in `app.config.ts`, alongside the identity change in 3.1, to mark the architecture
break. `eas.json` sets `appVersionSource: "remote"` with `autoIncrement` on the production profile,
which handles the Android `versionCode` separately — uploads will not be rejected for a duplicate.

The user-visible string never moves on its own, though. When a crew reports a bug, that string is
how you find out which build they are on, so bump it by hand on each release or drive it from the
git tag.

### 0.4 How EAS resolves the env vars — **resolved, and it was worse than assumed**

The original worry was that the production profile might silently resolve to development values. The
truth was blunter: **`eas env:list` returned "No variables found" for all three environments.** None
had ever been created.

Nothing had broken because every EAS build in the past year used the `development` profile, which
sets `developmentClient: true` — EAS builds only the native shell, and the JS comes from the local
Metro server at runtime, which reads `.env.local` off disk. A `preview` or `production` build
bundles the JS **on EAS's servers**, where `.env.local` does not exist because it is gitignored. All
three variables would have been `undefined`, `createClient(undefined, undefined)` would have thrown,
and the app would have died on launch.

Fixed by creating all three variables across development, preview and production at `plaintext`
visibility. Verify with:

```bash
npx eas env:list --environment production
```

**Two places dev values now live, and they can drift.** `apps/mobile/.env.local` governs everything
run locally through Metro; the EAS `development` environment governs cloud builds of that profile.
`npx eas env:pull --environment development` realigns them — but it overwrites `.env.local`, so copy
yours aside first if it holds extra keys.

### 0.5 Audit the RLS policies

Review `packages/supabase/policies/` against the tables in `apps/mobile/src/powersync/AppSchema.ts`,
paying particular attention to the `project_to_user` scoping.

**Why it belongs in Phase 0:** `apps/web/src/supabase/supabase.server.ts:3-4` reads the publishable
key from `import.meta.env`, which means Vite bakes it into a publicly downloadable JS bundle. That
is correct and by design — but it means **RLS is the entire security boundary**. Anyone who finds
the dashboard URL has the anon key. Do this before the site is reachable, not after.

### 0.6 Pin the Node version for EAS builds — **done**

`"node": "24.17.0"` on all three profiles in `apps/mobile/eas.json`.

Nothing in the repo said which Node to use, so EAS used its image default — Node 20 — while local
development ran Node 24. That went unnoticed until the first cloud build of this cycle died in
`INSTALL_DEPENDENCIES` before installing a single package:

```
warn: This version of pnpm requires at least Node.js v22.13
warn: The current version of Node.js is v20.19.4
Error [ERR_UNKNOWN_BUILTIN_MODULE]: No such built-in module: node:sqlite
```

With no version declared, EAS infers pnpm from the lockfile; the inferred 11.18.0 imports
`node:sqlite`, which exists only from Node 22. The last green build was 2026-07-18, before pnpm
moved that floor — so this was pure environment drift, and it would have failed the production
build identically.

Pinned to match the local toolchain exactly rather than merely clearing pnpm's floor, so cloud and
local resolve the same way.

## Phase 1 — backend environments

Separate projects per environment is the standard practice, for one concrete reason: there is
otherwise no way to test a destructive migration or a policy change except against the database the
field crews are writing to.

### 1.1 Capture the current schema as a baseline migration

`packages/supabase` currently holds `functions/`, `policies/` and `templates/` — there is no
migration history. Create one:

```bash
pnpm sb db pull
```

This writes a timestamped SQL file under `packages/supabase/migrations/` describing the current
schema. Commit it.

**Why it matters:** without a migration history, "make the other environment match" is a manual
diff, done by eye, against a schema nobody wrote down. With one, it is `pnpm sb db push`.

**The discipline this starts:** from here, every schema change is a new migration file, applied to
development first and production second. No more click-editing tables in the Supabase dashboard —
that is precisely how two environments drift apart without anyone noticing.

### 1.2 Promote the current project; create a fresh one for development

Keep the existing Supabase project as **production**. Create a new, empty project as
**development**, and bring it up by applying the baseline migration from 1.1.

**Why this direction:** it moves no data, so there is no migration to get wrong, and no device ever
has to re-sync from an empty backend. The empty project is the one that is cheap to create from
migrations, and it should be the one nobody depends on.

Rename both in the Supabase dashboard so they cannot be confused at a glance.

### 1.3 Configure what does not travel with a migration

Migrations carry tables, functions and RLS policies. They carry none of the following, and each has
to be set up per project. This is the list people get burned by:

| Item | Why it matters |
| --- | --- |
| Storage buckets and their policies | The photo bucket used by `apps/mobile/src/storage/SupabaseRemoteStorageAdapter.ts`. A missing bucket means uploads fail inside the attachment queue, where nobody sees them. |
| **Custom SMTP** | Supabase's built-in mailer is rate-limited to a handful of messages per hour and is explicitly not for production. Invites will simply stop arriving. Wire up Resend, SendGrid or SES. |
| Email templates | `packages/supabase/templates/invite.html` is uploaded to a project, not stored in the schema. |
| Auth redirect URLs | Must list the web dashboard domain *and* the `mmsbborelogapp://` scheme from `app.config.ts`, or auth callbacks dead-end. |
| Edge function secrets | `pnpm sb secrets set`, per project. |
| Edge function deploys | `pnpm sb:deploy` targets whichever project is linked. Both need it. |
| JWT signing keys | Different per project — and this is what PowerSync authenticates against, so the two must agree. |
| The `powersync` publication | Logical replication is what the sync service reads from. |

### 1.4 Move production to Supabase Pro

$25/month, and it is not optional.

The free tier **pauses a project after 7 days of inactivity**. A quiet fortnight and the app stops
working. Free also has no daily backups, which for the system of record on geotechnical survey data
is not a risk worth carrying. Pro adds backups, removes pausing, and includes database branching —
ephemeral preview databases, which makes testing migrations genuinely pleasant.

Development can stay on the free tier; pausing is harmless there.

### 1.5 Two PowerSync instances, sync rules in the repo

One instance per environment, each pointed at its own Supabase Postgres and configured with the
JWKS URL from *that* project. Commit the sync-rules YAML to the repo alongside the migrations.

**Why the YAML belongs in git:** sync rules decide which rows reach which device. Edited only in the
PowerSync dashboard, the two environments drift, and you end up testing against rules that do not
match production — the exact class of bug that stays invisible until a field engineer cannot see
their own project.

Depends on 0.1. Without the env var the second instance is unreachable from the app.

#### Which instance is which

**PowerSync creates the pair for you, named `Development` and `Production`, and the names cannot be
changed** — so the mapping is forced rather than chosen, and it is recorded here because the
dashboard is the only other place it exists. The instance id is the whole of the URL:
`https://<instance id>.powersync.journeyapps.com`.

| Role | Instance | Supabase project | Carried by |
| --- | --- | --- | --- |
| Production | `6a34ef0d0ef84ed671a2e6c9` | `ahrbovrexrkzpegtgxit` (the existing project, per 1.2) | EAS `production` |
| Development | `6a34ef0b35ca576ca0dde705` | the new empty project (1.2) | EAS `development` + `preview`, and `.env.local` |

The consequence of the fixed names is that the **existing** instance is the *Development* one, and it
is currently replicating from the project 1.2 turns into production. So both instances move:

1. Activate `Production` — connect it to `ahrbovrexrkzpegtgxit`, JWKS from that project, deploy the
   sync rules.
2. Repoint `Development` at the new dev project, JWKS from *it*. This drops its replication slot on
   production — see the warning below.
3. EAS `production`: `EXPO_PUBLIC_POWERSYNC_URL` → the Production instance. It currently holds the
   Development one, because until 1.2 there was only one of everything.
4. EAS `development` + `preview` and `.env.local`: Supabase URL and key → the new dev project. The
   PowerSync URL there is already correct.

Step 2 discards the Development instance's replicated data. That is fine — bucket storage is derived
from the source database and rebuilds itself.

**Do not leave the Development instance pointed at production.** It holds a logical replication slot
there, the free tier deactivates an instance after 1-2 weeks idle, and **Postgres retains WAL for an
inactive slot indefinitely** — it accumulates until it fills the disk. A dormant free-tier instance
with a live slot on the production database is a production outage with a slow fuse. Worth asking
PowerSync whether they drop the slot on deactivation; until that is answered, watch
`pg_replication_slots`:

```sql
select slot_name, active, wal_status,
       pg_size_pretty(pg_wal_lsn_diff(pg_current_wal_lsn(), restart_lsn)) as retained
from pg_replication_slots;
```

`wal_status` of `extended` or `lost` means it is already accumulating.

## Phase 2 — web dashboard

### 2.1 Deploy to Cloudflare Pages

Connect the repo; build command `pnpm install && pnpm build --filter web`; output directory
`apps/web/dist`.

The form, in full — the repo is a monorepo, so three of these are not the defaults:

| Field | Value |
| --- | --- |
| Repository | `jyue487/mmsb-borelog-app-v2` |
| Production branch | `main` |
| Framework preset | **None** — not "Vite". The preset assumes the Vite app is the repo root. |
| Root directory | `/` (leave empty). Turbo has to run from the workspace root. |
| Build command | `pnpm install --frozen-lockfile && pnpm build --filter web` |
| Build output directory | **leave empty** — see below |

Connecting to Git is a browser flow — it installs the Cloudflare GitHub App on the repository — so
it cannot be scripted.

**The build command and the deploy command are separate, and neither implies the other.** A deploy
command with no build command fails at `wrangler deploy` with

```
✘ [ERROR] The directory specified by the "assets.directory" field ... does not exist:
  /opt/buildhome/repo/apps/web/dist
```

which reads like a wrangler or config problem and is not one — `dist` is a build artifact, and
nothing built it. Confirmed on the first deploy attempt, 2026-09-04.

`--frozen-lockfile` rather than a bare `pnpm install`: it fails loudly if the lockfile and the
manifests disagree, instead of re-resolving, which is what follow-ups item 14 is about. Cloudflare
sets `CI=true`, under which pnpm already defaults to frozen — being explicit means not depending on
that.

**Build output directory stays empty.** It is a Pages-era field; here `wrangler.jsonc`'s
`assets.directory` is what decides what gets published, and giving this one a value is at best
redundant.

**Cloudflare no longer creates these as Pages projects.** A new static site is a **Worker with
static assets**, built by Workers Builds, and the difference is not cosmetic:

| | Classic Pages | Workers Builds (what this is) |
| --- | --- | --- |
| Env vars | Settings → Environment variables, with Production/Preview tabs | Settings → **Builds** → Variables and secrets. The *Runtime* section next to it is a different thing — see 2.3. |
| Publishing | uploads the output directory | runs a **deploy command** you supply |
| SPA fallback | `_redirects` | `not_found_handling` — see 2.2 |

So there is a third field the Pages form does not have:

| Field | Value |
| --- | --- |
| Deploy command | `cd apps/web && npx wrangler@4.128.0 deploy` |
| Version command | `cd apps/web && npx wrangler@4.128.0 versions upload --preview-alias <branch>` |

The **version command** is what non-production branches run instead of the deploy command: it
uploads a version and returns a preview URL without putting it on production traffic. Pin the same
wrangler version in both, or previews and production drift onto different tooling — the divergence
this whole phase exists to prevent. `--preview-alias` is optional and worth it for a long-lived
branch: without it every push gets a fresh hash-prefixed URL, with it the URL is
`<alias>-<worker>.<subdomain>.workers.dev` and stays put. It needs wrangler >= 4.21.0, and preview
URLs need the account's **workers.dev subdomain enabled** at all.

If a branch build runs the *deploy* command rather than the version command, branch control thinks
that branch is production.

`cd` rather than `--config` so that `assets.directory` is unambiguous — wrangler resolves it
relative to the config file, and there is no reason to depend on that being true of `--config` too.
The version is pinned in the command because wrangler is deliberately **not** a devDependency; see
follow-ups item 14 for why adding one is currently expensive. Bump it here when you want a newer
one.

**Branch control** governs which branch is the production build. It is `main` today, which holds
only `Init` — the work is on `jiayue-turborepo`, 137 commits ahead. Non-production branch builds are
enabled, so pushing `jiayue-turborepo` produces a preview URL and validates the whole pipeline
without a domain attached to it. Do that before repointing branch control or doing 2.4.

**Two things that decide whether the first build works, both prepared 2026-09-04:**

- **`.node-version` at the repo root, pinning `24.17.0`.** Pages picks a default Node for its build
  image otherwise, which trails the Node 24 this workspace expects. Pages reads `.node-version` (and
  `.nvmrc`); EAS pins the same version per profile in `eas.json`, so keep the two in step.
- **pnpm comes from `packageManager: pnpm@11.18.0`** in the root `package.json`, which Pages honours
  via corepack. Nothing to configure, but it is the reason `pnpm install` resolves the workspace
  rather than failing on `workspace:*` dependencies.

**Why not Vercel:** Vercel's Hobby tier is non-commercial only, and internal company tooling is
commercial use — so it would mean Pro at $20/user/month. Cloudflare Pages permits commercial use on
the free tier, with unlimited bandwidth and custom domains included. Netlify's free tier is
likewise commercially usable if you prefer its interface.

### 2.2 Add the SPA fallback — **done**

On Workers static assets the mechanism is **`not_found_handling` in `apps/web/wrangler.jsonc`**,
not `_redirects`:

```jsonc
"assets": {
  "directory": "./dist",
  "not_found_handling": "single-page-application"
}
```

That serves `index.html` with a 200 for any request matching no file. `wrangler deploy --dry-run`
confirms the config and reads the asset directory; the routing itself is only observable once
deployed, so hard-refresh a deep link such as `/projects/<code>/boreholes/BH-1` on the preview URL.

`apps/web/public/_redirects` is kept as well — it is the fallback every other static host
understands (Pages, Netlify), it costs 19 bytes, and Vite copies `public/` to the output root. But
on this deployment target it is **not** what does the work, so do not debug routing by editing it:

```
/* /index.html 200
```

**Why:** routes are declared inline in `apps/web/src/app/main.tsx` via react-router's
`BrowserRouter`, which is client-side only. Without the fallback the site works while navigating
within it, but a hard refresh or a pasted link to
`/projects/abc/boreholes/BH-1` returns a 404 from the CDN, because no such file exists. This
surfaces the first time somebody bookmarks a page.

Note that `main.tsx` already has a catch-all `<Route path="*">` that redirects to `/projects`. It
does not help here and is not a substitute: it runs only once `index.html` has loaded and react
has mounted, which is exactly what a CDN 404 prevents.

### 2.3 Set the environment variables

`VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`, pointed at production. Preview deployments
can point at development — but there is no development project until 1.2, so set both scopes to
production for now and revisit, rather than leaving Preview blank.

**Set them under Builds → Variables and secrets, not Runtime.** Workers Builds shows both, and
Runtime is the wrong one: it feeds the Worker when a request is served, and nothing here reads an
environment variable at request time. Proof, from the built bundle — `dist/assets/blockRow-*.js`
already contains the project URL and the publishable key as literals.

**These are build-time, not runtime.** Vite inlines `import.meta.env.VITE_*` by text substitution
into the bundle, exactly as `babel-preset-expo` does for `EXPO_PUBLIC_*` (0.1). Two consequences
that catch people:

- They must exist in the Pages project **before the first build**. Adding them afterwards changes
  nothing until a redeploy — there is no process environment to re-read at runtime.
- A build with them **unset does not fail**. Vite emits `undefined`, `createClient(undefined,
  undefined)` throws in the browser, and you get a white page from a green deployment.

`supabase.server.ts` now throws a named error saying which variable is missing, so that failure is
legible instead of a stack trace inside supabase-js. It is deliberately a *runtime* guard, matching
`Connector.ts` on mobile: a build-time check would also break `pnpm build` on a fresh clone that has
no `.env` yet. If a green-but-broken deploy ever actually happens, move the check into
`vite.config.ts` and take that trade.

### 2.4 Point a subdomain at it

Add a CNAME in the GoDaddy DNS panel: `borelog.<yourcompany>.com` → the Pages hostname.

**This costs nothing.** The domain is already owned; DNS records are free and unlimited. GoDaddy
bills for registration and for whatever hosts the existing site — a subdomain served by Cloudflare
adds nothing to that.

### 2.5 Optional: Cloudflare Access in front of the site

Free at this scale, and it gates the whole site behind an email-domain login before Supabase auth
even loads. Defence in depth, given that the dashboard is world-reachable and RLS is otherwise the
only lock. Skip it if 0.5 left you confident.

## Phase 3 — mobile release

### 3.1 The old app is a different app wearing the same package id

This is the item that matters most in the whole document, and it is not about timing.

The build on the crews' phones today (`507f66d`, 2025-10-14, published to Play) stores everything in
`mmsb.db` through `expo-sqlite`, with integer primary keys and no login. The new app stores
everything in `powersync.db` through op-sqlite, with client-generated `randomUUID()` ids, behind
`Stack.Protected`. **Nothing in the new codebase opens `mmsb.db`** — `src/db/db.ts`, `initDb.ts`,
`runMigrationsAsync.ts` and `migrations/**` are dead code that nothing imports.

So publishing the new AAB over the same listing does this:

1. Play replaces the binary. Same package id and signing key, so the data directory survives and
   `mmsb.db` is still physically on the phone.
2. The new app opens `powersync.db`. Empty.
3. The crew member gets a login screen, then an empty project list.

Their history is not deleted, leaked, or mis-assigned to the wrong owner — there is no code path by
which a row in `mmsb.db` reaches Supabase at all, so `project_to_user` never enters into it. It is
simply orphaned and invisible.

**The audit that settles what to do:** the historical data is already exported to reports, so the
archive is safe and no importer is needed. What is *not* covered is a job a crew member has open
right now — that work exists only in the old app, and an auto-update mid-job puts it out of reach.

**Decision: the new app ships under its own package id**, so it installs *alongside* the old one
instead of replacing it. Crews reach their checkpoints months apart, which rules out the alternative
of simply waiting to publish until the last job closes.

Each person finishes and exports in the old app, then opens the new one when ready. The old app is
left untouched as a read-only archive of `mmsb.db` and retired once everyone has moved. No
dependence on Play's update timing, and none on per-user settings.

The identity is set in `apps/mobile/app.config.ts`, one `bundleId` used for both platforms:

| variant | name | package / bundle id |
| --- | --- | --- |
| development | `MMSB Borelog (Dev)` | `com.mmsb.borelog.dev` |
| preview | `MMSB Borelog (Preview)` | `com.mmsb.borelog.preview` |
| production | `MMSB Borelog` | `com.mmsb.borelog` |

with `version: "2.0.0"` and `scheme: "mmsbborelog"`. The scheme had to move too — the old app claims
`mmsbborelogapp`, and two installed apps registering one scheme makes Android show a chooser on
every deep link. Nothing uses deep links yet, which is what made it cheap to change now.

`slug` and `extra.eas.projectId` deliberately did **not** change. They tie the code to the existing
EAS project, which holds the build history and the environment variables from 0.1; a new package id
inside one EAS project is normal, a new slug would orphan all of it.

**What does not work:** asking people to turn off auto-update. It is a per-app setting each user
toggles themselves, unenforceable and unverifiable, and one forgotten toggle is one lost job. Play's
staged rollout percentages do not help either — Play chooses who gets the update at random, so it
cannot track individual checkpoints. Both were considered and rejected for this reason.

`allowBackup: false` is set in `app.config.ts`, so Android's cloud backup is not a fallback either.

### 3.2 Verify a preview build against development, end to end

Install it on a device that **already has the old app**, because that is the only way to prove 3.1
actually worked:

- **Two icons must appear**, `MMSB Borelog (Preview)` beside the old `mmsb-borelog-app`.
- **The old app must still open and still list its boreholes** from `mmsb.db`. If its data is gone,
  the package id did not really change and the build replaced it — stop, and do not go near the
  production profile until it does.

Then exercise the new app: sign in, create a borehole, add blocks, go offline, add more, come back
online and confirm the sync drains, generate a PDF, run the AGS export.

This preview build is also the first bundle ever assembled on EAS servers with the environment
variables from 0.4 present, so a crash on launch means a missing variable rather than a code fault.
Either way it is the last chance to catch it before an immutable artifact reaches Play.

### 3.3 Build and submit

```bash
eas build --profile production --platform android
eas submit --profile production --platform android
```

The `production` profile in `eas.json` already sets `buildType: app-bundle` and `autoIncrement`,
which is what Play requires.

### 3.4 A new Play listing, its own signing key, and the closed testing track

Because 3.1 changed the package id, this is a **second app entry in the Play Console**, not a new
track on the existing one. Consequences worth knowing before you start clicking:

- **A new app signing key**, generated for this listing and unrelated to the old app's. That is
  expected and fine — the two apps are independent and neither can update the other.
- **The first AAB has to be uploaded through the console by hand.** `eas submit` can target the
  listing afterwards, but the app must exist and have had a first release before the API accepts
  uploads.
- **The tester list does not carry over.** Re-add the crews' Google account emails and circulate the
  new opt-in link.
- The remote `versionCode` counter **restarts at 1**, because EAS holds no version state for the new
  package id. Confirmed on the first build of `com.mmsb.borelog.dev`, which reported
  `Version code 1`. Harmless — a new listing accepts any starting value, it only has to increase
  from there.

Google holds the app signing key; EAS holds the upload key. **Do not lose or rotate the upload
key** — a signing mismatch forces users to uninstall and reinstall, and an uninstall *is* a real
local wipe (synced data still recovers; anything queued does not).

**Leave the old listing published** until every crew member has migrated, then unpublish it.
Unpublishing stops new installs while existing installs keep working, which is exactly what the
`mmsb.db` archive needs.

Play's "12 testers for 14 days" requirement only binds *personal* developer accounts seeking
production-track access. An organisation account, or a track that stays in closed testing
indefinitely, is unaffected.


### 3.5 Brief the crews before they open the new app

Two things they need to hear, because neither is discoverable from inside the app:

- **They will be asked to sign in**, where the old app never asked. Accounts have to exist and be
  assigned to projects via `project_to_user` before anyone tries, or their first experience is an
  empty list that looks like a bug. (An *app-side* cause of that same empty list was found and
  fixed while testing on device — `isSignIn` never became true on a restored session, so the list
  read the database before the first sync landed. It only ever showed on a fresh install, which is
  precisely what every crew member will be doing.)
- **Their old boreholes will not appear.** Say so explicitly, and say where the exported reports
  live. Otherwise the first reaction to an empty project list is "the app lost my data" — which is
  the wrong conclusion, but a very reasonable one from where they are standing.

Whether to leave Play auto-update on depends on which route 3.1 took. Under the separate-package-id
route it is moot for the transition and should simply be on, so post-launch fixes propagate. Under
the publish-once route, do not rely on it being off — 3.1 covers why.

## Phase 4 — after launch

- **Verify the backups actually run** on the Pro project. An untested backup is not a backup.
- **Watch the PowerSync dashboard** for sync errors through the first week. `Connector.ts` must
  throw rather than call `transaction.complete()` on failure — a swallowed error looks exactly like
  data loss from the user's side.
- **Hold the migration discipline**: development first, then production, always through a committed
  migration file.
- **Perform one OTA update deliberately**, early, while the stakes are low — so the channel is known
  to work before it is needed in an emergency. Change something visible, run
  `npx eas update --channel production`, then confirm a device picks it up on its *second* cold
  start (the first downloads it, the second runs it). If nothing arrives, the build's fingerprint
  and the update's do not match, and that is far better to discover now than during an incident.

---

With 0.1 and 0.4 closed, three items carry sharply more cost the day after launch than the day
before: **3.1**, because the old→new transition is decided the moment an AAB reaches that listing
and cannot be taken back; **0.2**, because enabling OTA updates later requires the store release it
exists to avoid; and **1.1**, because every environment decision downstream assumes a schema that is
written down.
