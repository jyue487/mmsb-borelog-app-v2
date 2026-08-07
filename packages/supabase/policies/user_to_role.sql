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
-- This file is ADDITIVE. Read this before running it.
-- ---------------------------------------------------------------------------
--
-- The project already has RLS enabled on user_to_role, a `security definer`
-- helper `public.get_current_user_role()` returning the caller's role_id, and
-- this policy:
--
--   "Owner can manage all user role assignments"
--     for all to public
--     using (get_current_user_role() = 1) with check (get_current_user_role() = 1)
--
-- None of that is touched here. This file adds only the two policies the
-- Members page needs on top of it, and it defines no helper of its own —
-- get_current_user_role() is the single source of truth for "who is the caller",
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
drop policy if exists "owners and admins may soft delete non-owners" on public.user_to_role;

-- Read. Without this, only owners can select from user_to_role, and the app is
-- broken for everyone else in a way that does not look like a permissions
-- error: AuthContextProvider's role lookup returns no rows, `role` resolves to
-- null, and ProtectedRoute renders the "access has been removed" panel to a
-- perfectly valid admin. The Members table would also read empty.
--
-- Any signed-in user who is themselves an active member sees the whole list. A
-- removed user matches nothing, which is exactly what makes the revocation
-- check work — their own role lookup returns null.
create policy "members readable by active members"
  on public.user_to_role
  for select
  to authenticated
  using (public.get_current_user_role() is not null);

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
-- Spot check
-- ---------------------------------------------------------------------------
--
-- Signed in as a viewer, this must report 0 rows updated:
--
--   update public.user_to_role
--   set deleted_at = now()
--   where user_id = '<some other member>';
--
-- Signed in as an admin, the same statement against a non-owner must report 1.
--
-- A disabled button in the UI proves nothing; these are the checks that do.
