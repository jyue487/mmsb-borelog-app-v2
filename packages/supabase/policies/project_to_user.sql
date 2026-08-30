-- Row level security for public.project_to_user, plus two fixes to the policies
-- on public.projects and public.boreholes that this table's predicates depend on.
--
-- This repo has no migration tooling (see CLAUDE.md — the expo-sqlite migration
-- directory is dead code and PowerSync owns the mobile schema), so this file is
-- reference SQL: run it by hand in the Supabase SQL editor, or with
--
--   pnpm sb db query --linked -f supabase/policies/project_to_user.sql
--
-- Note the `supabase/` prefix rather than `packages/supabase/`: the sb script
-- passes --workdir .., so paths resolve relative to packages/. See the README.
--
-- Role ids, from public.roles: 1 = owner, 2 = admin, 3 = supervisor, 4 = viewer.
-- These are mirrored in apps/web/src/supabase/memberRow.ts and again in
-- packages/supabase/functions/_shared/members.ts.
--
-- ---------------------------------------------------------------------------
-- Unlike user_to_role.sql, this file is NOT purely additive. Read this first.
-- ---------------------------------------------------------------------------
--
-- STEP 1 only adds policies. STEP 2 **narrows** access on public.projects, and
-- STEP 3 **widens** it on public.projects and public.boreholes. Both of those
-- drop and recreate policies this file does not own, so re-running the file is
-- safe but running it is not a no-op for anybody's access.
--
-- What changes, in one line each:
--
--   * Active members can read the whole assignment table; owners and admins can
--     write it. (New capability — the Add people modal on the project page.)
--   * A user assigned to one project stops seeing every OTHER project. (Fix.)
--   * Admins join owners in seeing everything, as they were always meant to.
--
-- ---------------------------------------------------------------------------
-- Before you run it: check who is currently assigned
-- ---------------------------------------------------------------------------
--
-- STEP 2 is the one with teeth. Until it runs, ANY user holding a single
-- project_to_user row can select and update EVERY project, so nobody has ever
-- needed a correct set of assignment rows. The moment it runs, supervisors and
-- viewers see only the projects they are actually assigned to — which for most
-- of them will be none.
--
--   pnpm sb db query --linked "select p.code, u.name, u.role_id
--     from project_to_user pu
--     join projects p on p.id = pu.project_id
--     join user_to_role u on u.user_id = pu.user_id
--     order by p.code, u.role_id"
--
-- Owners and admins are unaffected (STEP 3). Everyone else needs a row per
-- project, which is what the Add people modal on the project page is for — so
-- deploy this together with that UI, not ahead of it.

-- ---------------------------------------------------------------------------
-- STEP 1 — the assignment table itself
-- ---------------------------------------------------------------------------

alter table public.project_to_user enable row level security;

drop policy if exists "assignments readable by active members" on public.project_to_user;
drop policy if exists "owners and admins manage project assignments" on public.project_to_user;

-- Read. The table already carries a policy of its own,
--
--   "Users can see involved project assignments"  for select  using (user_id = auth.uid())
--
-- which is left in place: permissive policies combine with OR, so it is now
-- subsumed by this one rather than in conflict with it, and this file drops only
-- the policies it owns.
--
-- That existing policy is why the People panel could not be built without this
-- one: it shows you your own assignment row and nobody else's, so a project's
-- member list would always render as a list of one — you.
--
-- Any signed-in user who is themselves an active member sees every assignment.
-- That is no wider than user_to_role's own read policy, which already exposes
-- every member's name, email and role to the same audience. A removed member
-- matches nothing, because get_current_user_role() filters on deleted_at.
create policy "assignments readable by active members"
  on public.project_to_user
  for select
  to authenticated
  using (public.get_current_user_role() is not null);

-- One inbound dependency worth knowing about: public.shares_a_project_with(),
-- defined in policies/user_to_role.sql, reads this table to decide whether a
-- viewer may see another member's row. It is `security definer`, so it does NOT
-- go through the policy above and narrowing that policy will not silently break
-- it — which is exactly why it is a function rather than an inline subquery.

-- Write. `for all` rather than separate insert/delete policies because the
-- dashboard does both halves of a save in one operation and the rule is the
-- same for each: only owners and admins assign people to a project.
--
-- Unticking someone in the modal HARD DELETES their row. That is deliberate,
-- despite the deleted_at/deleted_by columns on this table: every predicate that
-- reads it — the two on projects below, the two on boreholes — tests only for
-- the row's existence, so a soft-deleted assignment would hide the person from
-- the UI while leaving their access completely intact. A soft delete here would
-- need those four predicates and PowerSync's sync rules to learn about
-- deleted_at in the same pass; until they do, `delete` is the honest verb.
create policy "owners and admins manage project assignments"
  on public.project_to_user
  for all
  to authenticated
  using (public.get_current_user_role() in (1, 2))
  with check (public.get_current_user_role() in (1, 2));

-- ---------------------------------------------------------------------------
-- STEP 2 — fix: the projects predicates are missing their correlation
-- ---------------------------------------------------------------------------
--
-- Both policies were deployed as
--
--   exists (select 1 from project_to_user pu where pu.user_id = auth.uid())
--
-- with no `pu.project_id = projects.id`. That subquery asks "does this user have
-- an assignment to ANY project", which is true for every assigned user against
-- every row — so one assignment granted select and update over the entire
-- projects table. The equivalent policies on boreholes correlate correctly; only
-- these two were wrong.
--
-- This is also what makes project assignment mean something. Without the fix,
-- ticking a box in the Add people modal writes a row that changes nothing.

drop policy if exists "Users can only see involved projects" on public.projects;
drop policy if exists "Users can only update involved projects" on public.projects;

create policy "Users can only see involved projects"
  on public.projects
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.project_to_user pu
      where pu.project_id = projects.id
        and pu.user_id = auth.uid()
    )
  );

-- Kept as update-only, matching what was deployed. Creating and deleting
-- projects stays with owners and admins through their policy below.
create policy "Users can only update involved projects"
  on public.projects
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.project_to_user pu
      where pu.project_id = projects.id
        and pu.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.project_to_user pu
      where pu.project_id = projects.id
        and pu.user_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- STEP 3 — admins get the bypass they were assumed to already have
-- ---------------------------------------------------------------------------
--
-- Both tables carried a bypass for role 1 only. Admins reached projects purely
-- through project_to_user, which nothing was writing — so before STEP 2 they
-- were carried by the missing correlation, and after it an admin with no
-- assignment row would see zero projects.
--
-- Admins already have full member management (invite, remove, set passwords, and
-- the Removed tab), so "sees every project" is the model the rest of the app
-- already assumes. It is also what lets the Add people modal offer only
-- supervisors and viewers: a tick box for someone who bypasses the check anyway
-- would be a control that does nothing.
--
-- The policies are renamed as well as widened, so the name stops saying owner.
-- The drops below name the OLD titles; re-running this file drops the new ones.

drop policy if exists "Owners can manage all projects" on public.projects;
drop policy if exists "Owners and admins can manage all projects" on public.projects;

create policy "Owners and admins can manage all projects"
  on public.projects
  for all
  to authenticated
  using (public.get_current_user_role() in (1, 2))
  with check (public.get_current_user_role() in (1, 2));

drop policy if exists "Owners can manage all boreholes" on public.boreholes;
drop policy if exists "Owners and admins can manage all boreholes" on public.boreholes;

create policy "Owners and admins can manage all boreholes"
  on public.boreholes
  for all
  to authenticated
  using (public.get_current_user_role() in (1, 2))
  with check (public.get_current_user_role() in (1, 2));

-- The two assignment-scoped policies on boreholes are left untouched. For
-- reference, they already correlate correctly and are what supervisors and
-- viewers rely on:
--
--   "Users can only see involved boreholes"   for select
--     using ((created_by)::uuid = auth.uid()
--            or exists (select 1 from project_to_user pu
--                       where pu.project_id = boreholes.project_id
--                         and pu.user_id = auth.uid()))
--
--   "Users can only edit involved boreholes"  for update
--     using / with check (exists (select 1 from project_to_user pu
--                                 where pu.project_id = boreholes.project_id
--                                   and pu.user_id = auth.uid()))

-- ---------------------------------------------------------------------------
-- Spot checks
-- ---------------------------------------------------------------------------
--
-- A disabled button in the UI proves nothing. Signed in as a VIEWER holding
-- exactly one assignment:
--
--   select count(*) from public.projects;
--     -- must be 1. Before STEP 2 this returned every project in the table.
--
--   insert into public.project_to_user (project_id, user_id)
--   values ('<any project id>', auth.uid());
--     -- must fail with 42501. RLS refuses the insert outright.
--
--   delete from public.project_to_user where user_id = auth.uid();
--     -- must report 0 rows. Note this is a SILENT no-op, not an error: RLS
--     -- filters the rows a delete can see rather than rejecting the statement.
--     -- That is why saveProjectPeople in apps/web/src/supabase/projectPeople.ts
--     -- asks for the deleted rows back with .select() and checks the count.
--
-- Signed in as an ADMIN with no assignment rows at all:
--
--   select count(*) from public.projects;   -- must be every project (STEP 3)
--
-- And confirm the shape of what is deployed:
--
--   pnpm sb db query --linked "select tablename, policyname, cmd, qual
--     from pg_policies where schemaname='public'
--       and tablename in ('project_to_user','projects','boreholes')
--     order by tablename, policyname"
