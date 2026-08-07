# @mmsb/supabase

The backend both clients share: edge functions and the RLS policy SQL for the one Supabase project
that `apps/web` and `apps/mobile` both talk to.

Not a package anything imports. It has no build output and nothing depends on it — it lives under
`packages/` because it is shared infrastructure rather than either app's, and it carries a
`package.json` only so the Supabase CLI is pinned here and the deploy commands have a home.

## Always run the CLI through these scripts

The Supabase CLI finds its project by looking for a directory literally named `supabase` inside its
working directory. This repo keeps that directory at `packages/supabase` rather than the repo root,
so every command needs `--workdir ..` — which the scripts below already pass.

**Running the bare CLI from the repo root does not fail loudly.** It reports no error and quietly
creates a second, empty `supabase/` directory at the root, which then shadows this one. If you ever
see a stray `supabase/` appear next to `apps/`, that is what happened: delete it and use a script.

Two scripts in the **root** `package.json` do this for you. Run them from anywhere in the repo:

```bash
pnpm sb <any supabase command>   # e.g. pnpm sb functions list
pnpm sb:check                    # type-check the functions (see below)
pnpm sb:deploy                   # check, then deploy both functions
```

`sb` forwards every argument through to the CLI, so anything in the Supabase docs works — just
replace `supabase` with `pnpm sb`.

One consequence of `--workdir`: **file paths are resolved relative to `packages/`, not to the repo
root.** So the policy file is `-f supabase/policies/user_to_role.sql`, not
`-f packages/supabase/policies/user_to_role.sql`. The latter fails looking for
`packages/packages/supabase/...`, which at least tells you what happened.

```bash
pnpm sb db query --linked -f supabase/policies/user_to_role.sql   # apply the policies
pnpm sb db query --linked "select * from pg_policies where tablename='user_to_role'"
pnpm sb db advisors --linked --type security
```

Do **not** reach for the raw binary. `pnpm exec supabase` from the repo root fails outright
("Command not found") because the CLI is a devDependency of this package rather than the workspace
root, and a globally installed `supabase` would be worse: it runs without `--workdir` and silently
creates the shadow directory described above.

Two naming traps if you add scripts here: plain `deploy` and `link` are **pnpm builtins** that
shadow same-named scripts without warning (`pnpm --filter @mmsb/supabase deploy` invokes pnpm's own
deploy and dies with `ERR_PNPM_INVALID_DEPLOY_TARGET`), and this package deliberately has no scripts
of its own so there is exactly one place to look — the root.

## First-time setup

```bash
pnpm sb login                          # interactive, opens a browser
pnpm sb link --project-ref <ref>       # creates config.toml
```

The project ref is in the dashboard URL: `supabase.com/dashboard/project/<ref>`. `link` writes
`config.toml` here — commit it, it is what records which project this repo points at.

`login` stores a personal developer token in `~/.supabase/`. That is not the service role key; the
service role key never leaves Supabase's servers and must never enter this repo or the Vite bundle.

## Contents

| Path | What it is |
| --- | --- |
| `functions/_shared/members.ts` | Shared by both functions: CORS, JSON helpers, role ids, `requireManagerCaller`, `findUserIdByEmail`, `setUserPassword`. Directories starting with `_` are bundled into importers rather than deployed as functions of their own. |
| `functions/invite-member/` | Creates a member. Supervisors get `createUser` with a password; everyone else gets an email invite. Re-adding a removed person lifts their ban. |
| `functions/set-member-password/` | Replaces a supervisor's password. |
| `functions/remove-member/` | Bans the auth account, then soft-deletes the membership row. |
| `policies/user_to_role.sql` | RLS policies. **Reference SQL, run by hand** in the Supabase SQL editor — there is no migration tooling in this repo. Additive: it uses the project's existing `get_current_user_role()` helper and leaves the existing owner policy alone. Read its STEP 1 header before running it. |

All three leave `verify_jwt` at its default (on) and authorize the caller themselves; see the header
comment in each. Deploying a function does **not** apply `policies/user_to_role.sql` — that is a
separate manual step.

## Why removal bans rather than deletes

Soft-deleting the `user_to_role` row is enough for the dashboard, which re-checks membership on every
load. It is **not** enough for the mobile app, which gates only on "is there a session". Since the
soft delete never touched `auth.users`, a removed supervisor kept signing in with
`signInWithPassword` and kept syncing. So `remove-member` bans the auth account too, and
`invite-member` lifts the ban when someone is added back.

Deleting the account instead would be simpler, and is the wrong trade here. Every foreign key into
`auth.users` in this project is `ON DELETE CASCADE`:

```
user_to_role.user_id       -> CASCADE   (the membership row and its audit trail)
project_to_user.user_id    -> CASCADE   (project assignments)
borehole_to_user.user_id   -> CASCADE   (borehole assignments)
```

and all eight `public` tables carry `created_by` / `updated_by` / `deleted_by` with **no** foreign
key at all — so a delete succeeds silently and leaves every one of them pointing at a user that no
longer exists. "Who logged this borehole" becomes unanswerable. A ban is the reversible version.

Two things a ban does not do: it does not invalidate an already-issued JWT before it expires (an
already-signed-in user keeps working until the next refresh fails), and it does not remove data
already synced to their device. Both are inherent to an offline-first client.

## Type checking

`supabase functions deploy` bundles **without** checking types, and these files sit outside every
`tsconfig.json`, so neither `pnpm build` nor `pnpm lint` sees them. Without `sb:check` a wrong API
shape deploys cleanly and fails at runtime.

`pnpm sb:deploy` runs the check first and stops on failure, so the normal path is covered. Run
`pnpm sb:check` on its own while iterating.

Both flags in that script are load-bearing:

- **`--node-modules-dir=none`** — Deno otherwise tries to resolve the JSR package's npm dependencies
  through `node_modules`, fails, and "helpfully" writes a `workspaces` field into the **root
  `package.json`**, creating a second source of truth alongside `pnpm-workspace.yaml`. With the flag
  it uses its own global cache and touches nothing.
- **`--no-lock`** — otherwise Deno drops a `deno.lock` at the repo root. Pinning would be false
  comfort anyway: the functions import `jsr:@supabase/supabase-js@2`, which Supabase's runtime
  re-resolves at deploy time, so checking against the floating version is the more honest test.

There is deliberately no `deno.json`. One inside this directory risks the Supabase CLI reading it as
a function import map, and the two flags above are all the configuration needed.
