-- Row level security for public.blocks.
--
-- Reference SQL: run it by hand, or with
--
--   pnpm sb db query --linked -f supabase/policies/blocks.sql
--
-- Safe to re-run — every policy is dropped by name before it is created.
--
-- Role ids, from public.roles: 1 = owner, 2 = admin, 3 = supervisor, 4 = viewer.
--
-- ---------------------------------------------------------------------------
-- The rules, in one table
-- ---------------------------------------------------------------------------
--
--                  select              insert / update / delete
--   owner    (1)    every block         no
--   admin    (2)    every block         no
--   supervisor (3)  assigned projects   assigned projects
--   viewer   (4)    assigned projects   no
--
-- "Assigned" means a project_to_user row for the caller and the project that
-- owns the block's borehole. `blocks` has no project_id of its own, so that
-- correlation goes through `boreholes` — see the helper below.
--
-- Owners and admins are deliberately READ-ONLY here for now, even though they
-- can manage projects and boreholes outright. Recording and editing a borehole
-- log is the field app's job, and the dashboard has no write path to `blocks`
-- at all (apps/web/src/app/BoreholePage.tsx only reads). Granting a write nobody
-- makes would be an untested policy waiting to be discovered by accident. When
-- editing on web lands, add the policies then and change the table above.
--
-- ---------------------------------------------------------------------------
-- What this replaces, and why the table was broken
-- ---------------------------------------------------------------------------
--
-- Measured 2026-08-25: `blocks` had RLS ENABLED and NO POLICIES. That denies
-- everything, so no authenticated caller could select, insert, update or delete
-- a block at all. The dashboard showed "No blocks logged" to everyone including
-- owners, because RLS returns an empty array rather than an error; and the field
-- app's uploads were rejected, retried forever (Connector.ts rethrows instead of
-- calling transaction.complete(), which is what makes PowerSync retry) and
-- stalled every entry queued behind them.
--
-- Until mid-2026 all four policies shared one predicate:
--
--   exists (select 1 from borehole_to_user bu
--           where bu.borehole_id = blocks.borehole_id
--             and bu.user_id = auth.uid())
--
-- Assignment then moved from the borehole to the project — borehole_to_user was
-- dropped in favour of project_to_user, and `boreholes` and `projects` were
-- repointed at it. `blocks` was not, so its policies died with the table they
-- referenced. This file is the replacement.

-- ---------------------------------------------------------------------------
-- STEP 1 — the correlation helper
-- ---------------------------------------------------------------------------
--
-- Is the caller assigned to the project that owns this borehole?
--
-- `security definer` for the same reason as public.shares_a_project_with() in
-- policies/user_to_role.sql: RLS applies to tables referenced inside a policy
-- expression, so an inline subquery here would be filtered by the policies on
-- `boreholes` and `project_to_user` as well. It happens to work today, but it
-- couples every future change on those two tables to this one — silently, since
-- the failure mode is an empty result rather than an error. A definer function
-- severs that, exactly as get_current_user_role() already does.
--
-- `set search_path` is not optional: a security definer function without a
-- pinned search_path is a privilege escalation vector, and Supabase's database
-- linter flags it.
create or replace function public.is_assigned_to_borehole_project(
  target_borehole_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.boreholes b
    join public.project_to_user pu on pu.project_id = b.project_id
    where b.id = target_borehole_id
      and pu.user_id = auth.uid()
  )
$$;

-- ---------------------------------------------------------------------------
-- STEP 2 — the policies
-- ---------------------------------------------------------------------------

alter table public.blocks enable row level security;

drop policy if exists "blocks readable by managers and assigned members" on public.blocks;
drop policy if exists "supervisors insert blocks on their projects" on public.blocks;
drop policy if exists "supervisors update blocks on their projects" on public.blocks;
drop policy if exists "supervisors delete blocks on their projects" on public.blocks;

-- Read.
--
-- The role is named explicitly in both branches rather than left to the
-- assignment check alone. get_current_user_role() returns null for a member who
-- has been removed — it filters on deleted_at — so `in (3, 4)` is also what
-- stops a removed supervisor reading logs with an already-issued JWT that has
-- not expired yet. Their project_to_user rows survive removal (only the
-- user_to_role row is soft deleted), so the assignment check on its own would
-- still pass for them.
create policy "blocks readable by managers and assigned members"
  on public.blocks
  for select
  to authenticated
  using (
    public.get_current_user_role() in (1, 2)
    or (
      public.get_current_user_role() in (3, 4)
      and public.is_assigned_to_borehole_project(borehole_id)
    )
  );

-- Write: supervisors only, and only on their own projects.
--
-- Three separate policies rather than one `for all`, so that "owners and admins
-- cannot write yet" is visible in the policy list instead of buried in a
-- predicate. It also keeps the read rule in exactly one place.
--
-- Insert and update are BOTH required by the field app even for a plain create:
-- PowerSync's Connector maps a PUT to an upsert, which is INSERT ... ON CONFLICT
-- DO UPDATE, and Postgres checks the update policy on the conflict path.
create policy "supervisors insert blocks on their projects"
  on public.blocks
  for insert
  to authenticated
  with check (
    public.get_current_user_role() = 3
    and public.is_assigned_to_borehole_project(borehole_id)
  );

-- `using` gates which rows may be touched; `with check` gates what they may
-- become. Both are needed, and with the same predicate — without the check, a
-- supervisor could reassign a block to a borehole on a project that is not
-- theirs.
create policy "supervisors update blocks on their projects"
  on public.blocks
  for update
  to authenticated
  using (
    public.get_current_user_role() = 3
    and public.is_assigned_to_borehole_project(borehole_id)
  )
  with check (
    public.get_current_user_role() = 3
    and public.is_assigned_to_borehole_project(borehole_id)
  );

-- Delete is a normal part of editing here, not an exceptional act: the field app
-- edits a block by deleting it and adding the replacement
-- (BlockDetailsInputForm.tsx). Denying delete would break editing, not protect
-- anything.
create policy "supervisors delete blocks on their projects"
  on public.blocks
  for delete
  to authenticated
  using (
    public.get_current_user_role() = 3
    and public.is_assigned_to_borehole_project(borehole_id)
  );

-- ---------------------------------------------------------------------------
-- A supervisor with no assignment still cannot upload
-- ---------------------------------------------------------------------------
--
-- These policies are necessary but not sufficient. Every write is gated on a
-- project_to_user row, and nothing on mobile creates one — assignment happens on
-- the dashboard, through the Add people modal on the project page. A supervisor
-- who is not assigned to the project will have their uploads denied and PowerSync
-- will retry them forever, exactly as it did when there were no policies at all.
--
-- So: after running this file, check that every supervisor who is expected to be
-- logging has a row.
--
--   select u.name, u.role_id, p.code
--   from user_to_role u
--   left join project_to_user pu on pu.user_id = u.user_id
--   left join projects p on p.id = pu.project_id
--   where u.role_id = 3 and u.deleted_at is null;

-- ---------------------------------------------------------------------------
-- Photos live in policies/block_photos.sql
-- ---------------------------------------------------------------------------
--
-- public.block_photos had the same problem as this table and was fixed the same
-- day, along with the Storage bucket the photos actually live in. Both halves
-- are in policies/block_photos.sql, because a correct table policy on its own
-- does not make a photo reachable.
--
-- An earlier version of this comment suggested correlating with
--
--   is_assigned_to_borehole_project(
--     (select b.borehole_id from blocks b where b.id = block_photos.block_id))
--
-- Do not use that form. The subquery reads public.blocks, which is now itself
-- RLS-protected by the policies above, so it gets filtered by them — the exact
-- coupling this file warns about at STEP 1, failing as an empty result rather
-- than an error. block_photos.sql defines public.is_assigned_to_block() instead,
-- a security definer wrapper over the whole chain.

-- ---------------------------------------------------------------------------
-- If you change these policies
-- ---------------------------------------------------------------------------
--
-- Postgres combines permissive policies with OR. So an ADDITIONAL permissive
-- policy cannot break the field app — but it CAN silently dismantle the access
-- model, because one over-broad policy is enough to grant everything regardless
-- of what the others say. "It only widens" is a statement about breakage, not
-- about safety.
--
-- Do NOT reach for `using (auth.uid() is not null)` to get something working
-- again. Per-assignment scoping is the product requirement: a user sees the work
-- assigned to them and nothing else.
--
-- PowerSync's sync rules decide what actually reaches a device and live in the
-- PowerSync dashboard, not this repo. They key off the same assignment concept
-- and have to move in step, or the field app and the backend disagree about who
-- can see what.

-- ---------------------------------------------------------------------------
-- Spot checks
-- ---------------------------------------------------------------------------
--
-- Simulate a caller without signing in (read-only, rolls back):
--
--   begin;
--   select set_config('request.jwt.claims',
--     '{"sub":"<user id>","role":"authenticated"}', true);
--   set local role authenticated;
--   select count(*) from public.blocks;
--   rollback;
--
-- Expected: an owner or admin sees every block. A supervisor or viewer sees only
-- the blocks under projects they are assigned to. A viewer's insert must fail
-- with 42501; an assigned supervisor's must succeed.
--
-- Then the real test, which no SQL can stand in for: record a block on a device
-- as an assigned supervisor and watch it reach the server, and open that
-- borehole's log in the dashboard.
