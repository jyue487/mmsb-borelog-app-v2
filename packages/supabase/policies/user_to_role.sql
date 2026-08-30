-- Row level security for public.user_to_role.
--
-- This repo has no migration tooling (see CLAUDE.md — the expo-sqlite migration
-- directory is dead code and PowerSync owns the mobile schema), so this file is
-- reference SQL: run it by hand in the Supabase SQL editor.
--
-- Role ids, from public.roles: 1 = owner, 2 = admin, 3 = supervisor, 4 = viewer.
-- These are mirrored in apps/web/src/supabase/memberRow.ts and again in
-- packages/supabase/functions/_shared/members.ts.
--
-- ---------------------------------------------------------------------------
-- This file is ADDITIVE with respect to the OWNER policy. Read this first.
-- ---------------------------------------------------------------------------
--
-- It owns two policies and one helper function, drops each by name before
-- creating it, and is safe to re-run. It does not touch the pre-existing owner
-- policy described below.
--
-- Note it is not purely additive in effect: as of 2026-08-25 the read policy
-- NARROWED. It used to admit every active member; it now admits supervisors and
-- above, plus your own row, plus anyone who shares a project with you. Viewers
-- lost the org-wide member directory, which is the point — see the Members page
-- gating in apps/web/src/app/RequireRole.tsx and canViewMembers() in
-- apps/web/src/data/memberRoles.ts.
--
-- The project already has RLS enabled on user_to_role, a `security definer`
-- helper `public.get_current_user_role()` returning the caller's role_id, and
-- this policy:
--
--   "Owner can manage all user role assignments"
--     for all to public
--     using (get_current_user_role() = 1) with check (get_current_user_role() = 1)
--
-- None of that is touched here. This file adds the two policies the Members page
-- needs on top of it, and one helper — public.shares_a_project_with(), for the
-- People panel's read path. It deliberately defines nothing that answers "who is
-- the caller": get_current_user_role() is the single source of truth for that,
-- and a second function doing the same job would be a drift risk rather than a
-- convenience.
--
-- The drop statements below name only this file's own policies, so re-running it
-- is safe and the owner policy above survives untouched.
--
-- Postgres combines permissive policies with OR. So an owner keeps unrestricted
-- access through their own policy regardless of what is written here; these
-- policies only ever *widen* access, never narrow it. One consequence worth
-- knowing: the `user_id <> auth.uid()` guard below does not stop an *owner* from
-- soft-deleting themselves, because their own policy already permits it. That
-- case is held by the UI and by the invariant check in EditMemberModal, not by
-- RLS.

-- ---------------------------------------------------------------------------
-- STEP 1 — confirm get_current_user_role() ignores removed members
-- ---------------------------------------------------------------------------
--
-- Everything below inherits this function's definition of "the caller's role".
-- If it does NOT filter out soft-deleted rows, then removing a member leaves
-- them with their old role: they keep passing the read policy, ProtectedRoute
-- keeps letting them in, and the removal feature silently does nothing. This is
-- the single most important precondition in this file.
--
-- Check it:
--
--   select pg_get_functiondef(oid) from pg_proc
--   where proname = 'get_current_user_role';
--
-- If the body has no `deleted_at is null`, patch it before going further. This
-- keeps the signature and the security definer property, so the existing owner
-- policy is unaffected — and it fixes that policy too, since a soft-deleted
-- owner should not retain owner powers either:
--
--   create or replace function public.get_current_user_role()
--   returns int
--   language sql
--   stable
--   security definer
--   set search_path = public          -- a security definer function without a
--   as $$                             -- pinned search_path is an escalation vector
--     select role_id
--     from public.user_to_role
--     where user_id = auth.uid()
--       and deleted_at is null
--     limit 1
--   $$;
--
-- It must be `deleted_at is null`, NEVER `deleted_at = null`. `= null` does not
-- evaluate to true or false in SQL — it evaluates to null, which `where` treats
-- as "no". So that version matches zero rows, the function returns null for
-- every caller, and the owner policy's `get_current_user_role() = 1` stops being
-- true for anybody. That locks every user out of the dashboard, owner included,
-- recoverable only through the SQL editor or the service role key.
--
-- Two smaller things the patch above adds, both worth keeping:
--   * `set search_path = public` — a security definer function without a pinned
--     search_path is a privilege escalation vector, and Supabase's own database
--     linter flags it ("Function Search Path Mutable").
--   * `limit 1` — user_to_role has one row per user today, but a `returns int`
--     function silently takes the first of however many rows it gets, so the
--     limit makes that explicit rather than incidental.

-- ---------------------------------------------------------------------------
-- STEP 2 — the policies
-- ---------------------------------------------------------------------------

alter table public.user_to_role enable row level security;

drop policy if exists "members readable by active members" on public.user_to_role;
drop policy if exists "members readable by supervisors and above" on public.user_to_role;
drop policy if exists "owners and admins may soft delete non-owners" on public.user_to_role;

-- Helper for the third clause of the read policy below: does the caller share a
-- project with this person?
--
-- A function rather than an inline `exists`, and `security definer` for a
-- specific reason. RLS applies to tables referenced inside a policy expression,
-- so an inline subquery over project_to_user would see only the assignment rows
-- the *caller* is allowed to read. It works today, because project_to_user lets
-- any active member read the whole table — but the day someone narrows that,
-- this clause silently starts matching nothing, the People panel on the project
-- page empties for viewers, and nothing anywhere reports an error. A definer
-- function severs that coupling, exactly as get_current_user_role() already
-- does for "who is the caller".
--
-- (This does not contradict this file's header note about defining nothing that
-- answers "who is the caller". That is about not duplicating
-- get_current_user_role(). This answers a different question.)
--
-- `set search_path` is not optional: a security definer function without a
-- pinned search_path is a privilege escalation vector, and Supabase's database
-- linter flags it.
create or replace function public.shares_a_project_with(target_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.project_to_user mine
    join public.project_to_user theirs on theirs.project_id = mine.project_id
    where mine.user_id = auth.uid()
      and theirs.user_id = target_user_id
  )
$$;

-- Read. Three clauses, OR'd:
--
--   1. your own row              — ALWAYS. See the warning below.
--   2. supervisor and above      — role ids 1, 2, 3. The member directory.
--   3. someone on your projects  — so the People panel keeps working.
--
-- Without ANY read policy, only owners can select from user_to_role and the app
-- breaks for everyone else in a way that does not look like a permissions error:
-- AuthContextProvider's role lookup returns no rows, `role` resolves to null,
-- and ProtectedRoute renders the "access has been removed" panel to a perfectly
-- valid admin.
--
-- ***********************************************************************
-- * CLAUSE 1 IS LOAD-BEARING. Do not "simplify" it away.                *
-- ***********************************************************************
--
-- apps/web/src/context/auth.tsx resolves the signed-in user's own role by
-- selecting their user_to_role row — through this policy. Clause 2 does not
-- cover a viewer (role 4), and clause 3 does not cover a viewer with no project
-- assignments. Drop clause 1 and every such user reads zero rows, `role`
-- resolves to null, and ProtectedRoute tells them their access has been removed.
-- They are locked out of the ENTIRE dashboard, not just the Members page,
-- recoverable only from the SQL editor. Same class of trap as STEP 1 above.
--
-- Clause 2 mirrors canViewMembers() in apps/web/src/data/memberRoles.ts, which
-- hides the nav item and gates the /members route. That is the affordance; this
-- is the enforcement. Move them together.
--
-- A removed user matches nothing through clauses 2 and 3 — get_current_user_role()
-- filters on deleted_at — and reaches only their own row through clause 1, which
-- is what makes the revocation check work: ProtectedRoute reads `deleted_at is
-- null` in its own query, so a removed member still resolves to a null role.
create policy "members readable by supervisors and above"
  on public.user_to_role
  for select
  to authenticated
  using (
    user_id = auth.uid()
    or public.get_current_user_role() in (1, 2, 3)
    or public.shares_a_project_with(user_id)
  );

-- Write. NOTE: as of the remove-member edge function, the dashboard no longer
-- performs this update itself — removal moved server-side so it could ban the
-- auth account in the same operation, and the service role bypasses RLS anyway.
-- This policy is therefore vestigial for the app, and is kept only so that a
-- direct API update by an admin stays bounded by the same rules rather than
-- being denied outright. Dropping it would be strictly tighter; owners would
-- keep write access through their own policy. Left in place deliberately, not
-- by oversight.
--
--   get_current_user_role() in (1, 2)  -- owners and admins only
--   role_id <> 1                       -- never an owner row
--   user_id <> auth.uid()              -- never yourself
--
-- The `with check` repeats `role_id <> 1` so a row cannot be updated *into*
-- being an owner: `using` gates which rows may be touched, `with check` gates
-- what they may become, and without both an admin could promote themselves.
--
-- This exists for admins. Owners already have it via their own policy.
create policy "owners and admins may soft delete non-owners"
  on public.user_to_role
  for update
  to authenticated
  using (
    public.get_current_user_role() in (1, 2)
    and role_id <> 1
    and user_id <> auth.uid()
  )
  with check (role_id <> 1);

-- No insert and no delete policy added here, deliberately. Inserts and revivals
-- happen only in the invite-member edge function, whose service role client
-- bypasses RLS, and nothing in the dashboard hard-deletes a member.

-- ---------------------------------------------------------------------------
-- Note: two service-role functions sit outside these policies
-- ---------------------------------------------------------------------------
--
-- invite-member and set-member-password both write to auth.users — the first
-- creates the account (with a password, for supervisors), the second replaces a
-- supervisor's password. Nothing here needs to change for that: passwords live
-- in auth.users, not in any column this table governs.
--
-- What matters is that neither function is constrained by the policies above.
-- Their authorization is the caller-role check in
-- packages/supabase/functions/_shared/members.ts (requireManagerCaller), and for
-- the password function additionally a check that the *target* is a supervisor.
-- If you tighten the rules here, tighten them there too — the two are kept in
-- step by hand.

-- ---------------------------------------------------------------------------
-- Spot checks
-- ---------------------------------------------------------------------------
--
-- A disabled button, or a nav item that is not rendered, proves nothing. These
-- are the checks that do.
--
-- WRITE. Signed in as a viewer, this must report 0 rows updated:
--
--   update public.user_to_role
--   set deleted_at = now()
--   where user_id = '<some other member>';
--
-- Signed in as an admin, the same statement against a non-owner must report 1.
--
-- READ. Signed in as a VIEWER:
--
--   select count(*) from public.user_to_role;
--     -- their own row, plus anyone sharing a project with them. NOT the whole
--     -- table. Before 2026-08-25 this returned every member.
--
--   select count(*) from public.user_to_role where user_id = auth.uid();
--     -- MUST be 1. If it is 0, clause 1 of the read policy is broken and that
--     -- viewer is locked out of the whole dashboard, not just Members. Fix it
--     -- here before anyone signs in.
--
-- Signed in as a SUPERVISOR:
--
--   select count(*) from public.user_to_role;   -- every member, removed included
--
-- Then confirm in the browser, which is where the lockout would actually show:
-- sign in as a viewer and check they land on Projects rather than on "Your
-- access has been removed".
