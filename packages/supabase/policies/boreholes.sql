-- Row level security for public.boreholes, plus the one thing RLS cannot
-- express: the borehole name is not editable below admin.
--
-- Reference SQL: run it by hand, or with
--
--   pnpm sb db query --linked -f supabase/policies/boreholes.sql
--
-- Safe to re-run — every policy, the function and the trigger are dropped or
-- replaced by name before they are created.
--
-- Role ids, from public.roles: 1 = owner, 2 = admin, 3 = supervisor, 4 = viewer.
--
-- ---------------------------------------------------------------------------
-- The rules, in one table
-- ---------------------------------------------------------------------------
--
--                    select                 rename    edit other fields
--   owner      (1)    every borehole         yes       yes
--   admin      (2)    every borehole         yes       yes
--   supervisor (3)    assigned projects      NO        assigned projects
--   viewer     (4)    assigned projects      NO        no
--
-- "Assigned" means a project_to_user row for the caller and the borehole's
-- project. Unlike `blocks`, `boreholes` carries project_id itself, so the
-- correlation is a direct exists() and needs no definer helper.
--
-- Insert and delete are owners and admins only, through the `for all` policy
-- below. Boreholes are created on the dashboard in bulk
-- (apps/web/src/components/AddBulkBoreholesModal.tsx); the field app records
-- into boreholes that already exist.
--
-- ---------------------------------------------------------------------------
-- Why the name is special
-- ---------------------------------------------------------------------------
--
-- `boreholes.name` is the borehole's identity, not one of its attributes:
--
--   * it is the URL key on the dashboard —
--     /projects/:projectCode/boreholes/:boreholeName, resolved by
--     fetchBoreholeByProjectIdAndName in apps/web/src/app/BoreholePage.tsx — so
--     a rename breaks every link anyone has kept;
--   * it is what the report and the AGS export are filed under;
--   * there is NO unique constraint on (project_id, name), and the only
--     duplicate check anywhere is client side and within one pasted batch
--     (AddBulkBoreholesModal). A rename is the easiest way to end up with two
--     boreholes the URL cannot tell apart.
--
-- So renaming stays a dashboard action for owners and admins. A supervisor may
-- correct everything else about the borehole they are logging.
--
-- ---------------------------------------------------------------------------
-- What this replaces
-- ---------------------------------------------------------------------------
--
-- The borehole policies used to be split: the owner/admin one lived in
-- policies/project_to_user.sql, and the two assignment-scoped ones were only
-- QUOTED there, in a comment, because they had been created in the dashboard and
-- were being left alone. This file is now the single record for the table.
--
-- The policy being retired is:
--
--   "Users can only edit involved boreholes"  for update
--     using / with check (exists (select 1 from project_to_user pu
--                                 where pu.project_id = boreholes.project_id
--                                   and pu.user_id = auth.uid()))
--
-- It carries no role at all, so any assigned user — a VIEWER included — could
-- change any field of any borehole on their project, name included. That gap is
-- docs/follow-ups.md item 0f, which asked for the intended rule to be decided
-- before either side moved. The table at the top of this file is that decision.

-- ---------------------------------------------------------------------------
-- STEP 1 — the policies
-- ---------------------------------------------------------------------------

alter table public.boreholes enable row level security;

drop policy if exists "Owners can manage all boreholes" on public.boreholes;
drop policy if exists "Owners and admins can manage all boreholes" on public.boreholes;
drop policy if exists "Users can only see involved boreholes" on public.boreholes;
drop policy if exists "Users can only edit involved boreholes" on public.boreholes;
drop policy if exists "supervisors update boreholes on their projects" on public.boreholes;

-- Owners and admins: everything, on every project. They hold no project_to_user
-- rows — assignment is how supervisors and viewers are scoped, not how managers
-- are granted — so this is what gets them in at all.
create policy "Owners and admins can manage all boreholes"
  on public.boreholes
  for all
  to authenticated
  using (public.get_current_user_role() in (1, 2))
  with check (public.get_current_user_role() in (1, 2));

-- Read. Carried over unchanged from what was deployed.
--
-- The created_by branch is deliberate and is why an unassigned supervisor can
-- still list a borehole they created while seeing none of its blocks — the
-- `blocks` policy has no matching clause. See docs/follow-ups.md item 0c.
create policy "Users can only see involved boreholes"
  on public.boreholes
  for select
  to authenticated
  using (
    (created_by)::uuid = auth.uid()
    or exists (
      select 1
      from public.project_to_user pu
      where pu.project_id = boreholes.project_id
        and pu.user_id = auth.uid()
    )
  );

-- Write: supervisors only, and only on their own projects. This is the field
-- app's own write path — EditBoreholeInputForm on mobile drains through
-- PowerSync's CRUD queue into a PATCH here.
--
-- The role is named explicitly rather than left to the assignment check alone,
-- for the same reason blocks.sql names it: get_current_user_role() filters on
-- deleted_at, while project_to_user rows survive removal, so `= 3` is what stops
-- a removed supervisor writing with a JWT that has not expired yet. It is also
-- what closes the viewer gap described above.
--
-- `using` gates which rows may be touched; `with check` gates what they may
-- become. Both are needed, and with the same predicate — without the check a
-- supervisor could move a borehole to a project that is not theirs.
create policy "supervisors update boreholes on their projects"
  on public.boreholes
  for update
  to authenticated
  using (
    public.get_current_user_role() = 3
    and exists (
      select 1
      from public.project_to_user pu
      where pu.project_id = boreholes.project_id
        and pu.user_id = auth.uid()
    )
  )
  with check (
    public.get_current_user_role() = 3
    and exists (
      select 1
      from public.project_to_user pu
      where pu.project_id = boreholes.project_id
        and pu.user_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- STEP 2 — the name, which needs a trigger rather than a policy
-- ---------------------------------------------------------------------------
--
-- A policy predicate sees the old row (`using`) or the new row (`with check`),
-- never both, so "this column may not change" is not expressible as a policy.
-- Two alternatives were considered and rejected:
--
--   * Column privileges. `revoke update (name)` is a NO-OP while table-level
--     UPDATE is granted, so it would mean revoking UPDATE on the table and
--     granting it back column by column — and a column added later would then be
--     silently un-updatable, with no error to say so.
--   * A `with check` that re-reads the old name in a subquery. It depends on
--     statement-snapshot semantics to see the pre-update value. Too clever to
--     rest an access rule on.
--
-- This is the first trigger in the public schema. If more join it, note that
-- Postgres fires BEFORE ROW triggers in name order.
create or replace function public.enforce_borehole_name_immutable()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  if new.name is distinct from old.name
     and auth.uid() is not null
     and coalesce(public.get_current_user_role(), -1) not in (1, 2) then
    raise exception 'Only owners and admins may rename a borehole'
      using errcode = '42501';
  end if;

  return new;
end;
$$;

drop trigger if exists boreholes_name_immutable on public.boreholes;

-- Four details here are load-bearing:
--
--   `before update OF name` — fires only when name appears in the statement's
--     SET list, so an ordinary field edit does not pay for it at all.
--
--   `is distinct from` — a write that re-sends the same name is not a rename.
--     It is also null-safe, which `<>` is not.
--
--   `auth.uid() is not null` — leaves the SQL editor, the service role and the
--     edge functions able to correct a name. Without it, fixing a typo by hand
--     would mean disabling the trigger first, and anyone who did that would have
--     to remember to put it back.
--
--   `coalesce(..., -1)` — a removed member has role null, and `null not in
--     (1, 2)` is null, which is not true, which would ALLOW the rename. RLS
--     already stops them, but this predicate should not depend on that.
create trigger boreholes_name_immutable
  before update of name on public.boreholes
  for each row
  execute function public.enforce_borehole_name_immutable();

-- ---------------------------------------------------------------------------
-- The clients, and why the trigger raising rather than filtering matters
-- ---------------------------------------------------------------------------
--
-- RLS on UPDATE and DELETE FILTERS rows: a write that no policy admits affects
-- zero rows and returns success. A trigger RAISES. The two failure modes reach
-- the field app very differently, and both are worth knowing:
--
--   * A rejected rename is an ERROR. apps/mobile/src/powersync/Connector.ts
--     rethrows instead of calling transaction.complete() — that is what makes
--     PowerSync retry — so a single rejected rename would stall every upload
--     queued behind it on that device, forever. Mobile therefore does not send
--     the column at all: editBoreholeDbAsync.ts has no `name = ?` in its SET
--     list, and EditBoreholeInputForm renders the name as text.
--
--   * A viewer's edit, or a supervisor's delete, is SILENT. It reports success
--     having touched nothing, and the next sync brings the unchanged row back
--     down. That is what mobile's borehole delete button used to do, and why it
--     was removed rather than made to work.
--
-- Keep both clients in step with this file:
--   apps/web/src/data/memberRoles.ts        canEditBoreholeDetails -> (1, 2)
--   apps/web/src/components/EditBoreholeModal.tsx   the only rename UI
--   apps/mobile/src/components/borehole/EditBoreholeInputForm.tsx   name is text
--
-- PowerSync's sync rules decide what actually reaches a device and live in the
-- PowerSync dashboard, not this repo. They key off the same assignment concept
-- and have to move in step with any predicate change here.

-- ---------------------------------------------------------------------------
-- Spot checks
-- ---------------------------------------------------------------------------
--
-- A read-only input proves nothing. Simulate a caller without signing in — this
-- rolls back, so it is safe to run against the live project:
--
--   begin;
--   select set_config('request.jwt.claims',
--     '{"sub":"<user id>","role":"authenticated"}', true);
--   set local role authenticated;
--
--   -- as an assigned SUPERVISOR: succeeds, 1 row
--   update public.boreholes set type_of_rig = 'SPOT CHECK' where id = '<id>';
--
--   -- as the same supervisor: fails, 42501,
--   -- "Only owners and admins may rename a borehole"
--   update public.boreholes set name = 'SPOT-CHECK' where id = '<id>';
--
--   -- as an assigned VIEWER: 0 rows, no error. Before this file it was 1.
--   update public.boreholes set type_of_rig = 'SPOT CHECK' where id = '<id>';
--
--   -- as an ADMIN: both succeed
--   rollback;
--
-- And the check no SQL can stand in for: edit a borehole's rig on a device as an
-- assigned supervisor and watch it reach the server without the CRUD queue
-- stalling behind it.
