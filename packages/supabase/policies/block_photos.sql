-- Row level security for block photos: public.block_photos AND the objects in
-- the Storage bucket they point at.
--
-- Both halves are in one file on purpose. A photo needs two things to be
-- reachable — a row in public.block_photos and the JPEG bytes in Storage — and
-- they are governed by two different sets of policies in two different schemas.
-- Getting one right and not the other produces a photo that exists and cannot be
-- seen, with no error anywhere.
--
-- Reference SQL: run it by hand, or with
--
--   pnpm sb db query --linked -f supabase/policies/block_photos.sql
--
-- Safe to re-run — every policy is dropped by name before it is created.
--
-- Role ids, from public.roles: 1 = owner, 2 = admin, 3 = supervisor, 4 = viewer.
--
-- ---------------------------------------------------------------------------
-- STEP 3 writes to another schema. Check it landed.
-- ---------------------------------------------------------------------------
--
-- storage.objects is owned by supabase_storage_admin, and `pnpm sb` connects as
-- `postgres`, which is not a member of that role and is not a superuser:
--
--   select current_user,
--          pg_has_role(current_user, 'supabase_storage_admin', 'MEMBER');
--   -- postgres | false
--
-- It worked anyway when this was first applied (2026-08-25) — postgres holds
-- enough privilege on the managed platform. But it is the one part of this file
-- that depends on something outside the public schema, so if it ever fails with
-- "must be owner of table objects", run STEP 3 from the dashboard's SQL editor
-- or build the same three policies in Storage -> Policies.
--
-- Check before going near STEP 4, which drops the policy currently granting all
-- Storage access. Dropping it while STEP 3 has not applied takes photos from
-- "wide open" straight to "completely broken" — no uploads, no downloads, no
-- deletes, and a PowerSync queue that retries forever.
--
--   select policyname, cmd from pg_policies where schemaname = 'storage';
--
-- ---------------------------------------------------------------------------
-- Deploy in two passes
-- ---------------------------------------------------------------------------
--
-- STEPS 1-3 are additive. The wide-open Storage policy is still in place while
-- they run, and Postgres combines permissive policies with OR, so nothing
-- changes behaviourally — they only put the new predicates somewhere they can be
-- tested. Run them, work through the spot checks at the foot of this file, and
-- only then run STEP 4, which is where enforcement actually begins.
--
-- ---------------------------------------------------------------------------
-- The rules
-- ---------------------------------------------------------------------------
--
--   public.block_photos          select              insert / update / delete
--     owner      (1)             every photo         no
--     admin      (2)             every photo         no
--     supervisor (3)             assigned projects   assigned projects
--     viewer     (4)             assigned projects   no
--
--   storage.objects              select              insert / delete
--     owner      (1)             every object        no
--     admin      (2)             every object        no
--     supervisor (3)             assigned projects   any object in the bucket
--     viewer     (4)             assigned projects   no
--
-- The two select columns match deliberately. A synced-down block_photos row is
-- what makes the attachment queue download a file — it watches
-- `SELECT id FROM block_photos` and queues anything with no local copy. If a
-- role can read the row but not the object, the download 403s and the photo
-- silently never appears. See docs/follow-ups.md item 0c for that failure mode.
--
-- Storage insert and delete are role-gated only, with no per-object lookup.
-- That is a considered trade, explained at STEP 3.
--
-- block_photos mirrors public.blocks, one table further out: blocks correlates
-- borehole -> project, this correlates block -> borehole -> project.

-- ---------------------------------------------------------------------------
-- STEP 1 — the correlation helpers
-- ---------------------------------------------------------------------------
--
-- `security definer`, like public.is_assigned_to_borehole_project() and
-- public.shares_a_project_with() before them, and for the same reason: RLS
-- applies to tables referenced inside a policy expression. An inline subquery
-- over public.blocks here would be filtered by the blocks SELECT policy, which
-- couples this policy to that one silently — the failure mode is an empty result
-- rather than an error.
--
-- That matters concretely. blocks.sql and docs/follow-ups.md both sketched the
-- inline form
--
--   is_assigned_to_borehole_project(
--     (select b.borehole_id from blocks b where b.id = block_photos.block_id))
--
-- and it is the wrong shape for exactly this reason. These two functions replace
-- that suggestion.
--
-- `set search_path` is not optional: a security definer function without a
-- pinned search_path is a privilege escalation vector, and Supabase's database
-- linter flags it.

-- Used by the block_photos policies.
create or replace function public.is_assigned_to_block(target_block_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.blocks bl
    join public.boreholes b on b.id = bl.borehole_id
    join public.project_to_user pu on pu.project_id = b.project_id
    where bl.id = target_block_id
      and pu.user_id = auth.uid()
  )
$$;

-- Used by the storage.objects policies.
--
-- The bucket has no folder structure to key off: the attachment queue names
-- objects `${block_photos.id}.jpg`, flat at the bucket root, so the only way
-- from an object to a project is this lookup. Verified against live data —
-- storage.objects.name = block_photos.id || '.jpg' for every uploaded photo.
--
-- Returns NULL, not false, when no row owns the object. A policy treats NULL as
-- deny, which is what makes an orphaned object unreachable.
--
-- split_part rather than a cast so a non-UUID name — the dashboard's
-- .emptyFolderPlaceholder, say — compares as text and misses, instead of raising
-- an invalid-input error inside a policy.
create or replace function public.is_assigned_to_photo_object(object_name text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_assigned_to_block(bp.block_id)
  from public.block_photos bp
  where bp.id::text = split_part(object_name, '.', 1)
$$;

-- ---------------------------------------------------------------------------
-- STEP 2 — public.block_photos
-- ---------------------------------------------------------------------------

alter table public.block_photos enable row level security;

drop policy if exists "block photos readable by managers and assigned members" on public.block_photos;
drop policy if exists "supervisors insert block photos on their projects" on public.block_photos;
drop policy if exists "supervisors update block photos on their projects" on public.block_photos;
drop policy if exists "supervisors delete block photos on their projects" on public.block_photos;

-- Read.
--
-- The role is named in both branches rather than left to the assignment check
-- alone. get_current_user_role() returns null for a removed member — it filters
-- on deleted_at — while their project_to_user rows survive removal, so the
-- assignment check on its own would still pass for someone holding an
-- unexpired JWT.
create policy "block photos readable by managers and assigned members"
  on public.block_photos
  for select
  to authenticated
  using (
    public.get_current_user_role() in (1, 2)
    or (
      public.get_current_user_role() in (3, 4)
      and public.is_assigned_to_block(block_id)
    )
  );

-- Write: supervisors only, on their own projects.
--
-- No `deleted_at is null` anywhere in this file. The client hard-deletes
-- (`DELETE FROM block_photos WHERE id = ?` in CameraComponent.tsx) and never
-- writes deleted_at, created_at or updated_at, so a soft-delete clause would
-- match nothing that exists.
create policy "supervisors insert block photos on their projects"
  on public.block_photos
  for insert
  to authenticated
  with check (
    public.get_current_user_role() = 3
    and public.is_assigned_to_block(block_id)
  );

-- Nothing in either app ever issues an UPDATE against this table — and the
-- policy is still required. PowerSync's Connector maps a PUT to
-- `table.upsert(record)`, which is INSERT ... ON CONFLICT DO UPDATE, and
-- Postgres checks the UPDATE policy on the conflict path. Without this, a photo
-- re-sent after a partial upload is denied and the whole CRUD transaction
-- stalls. Same trap as on public.blocks.
create policy "supervisors update block photos on their projects"
  on public.block_photos
  for update
  to authenticated
  using (
    public.get_current_user_role() = 3
    and public.is_assigned_to_block(block_id)
  )
  with check (
    public.get_current_user_role() = 3
    and public.is_assigned_to_block(block_id)
  );

create policy "supervisors delete block photos on their projects"
  on public.block_photos
  for delete
  to authenticated
  using (
    public.get_current_user_role() = 3
    and public.is_assigned_to_block(block_id)
  );

-- ---------------------------------------------------------------------------
-- STEP 3 — storage.objects        (may need the dashboard; see the header)
-- ---------------------------------------------------------------------------
--
-- The bucket name is hardcoded, matching the bare literal at
-- apps/mobile/src/storage/SupabaseRemoteStorageAdapter.ts:68. There is one
-- bucket and the string appears in exactly one place in the app; renaming it
-- means changing both, together.

drop policy if exists "photos readable by managers and assigned members" on storage.objects;
drop policy if exists "supervisors upload photos" on storage.objects;
drop policy if exists "supervisors delete photos" on storage.objects;

-- Read. Same shape as the block_photos read policy above, on purpose — see the
-- note about the two select columns in the header.
create policy "photos readable by managers and assigned members"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'Testing'
    and (
      public.get_current_user_role() in (1, 2)
      or public.is_assigned_to_photo_object(name)
    )
  );

-- Upload. Role only — deliberately NOT scoped to the object's project.
--
-- The file and its block_photos row travel over two independent queues with no
-- ordering guarantee: the attachment queue PUTs the bytes to Storage, the CRUD
-- queue POSTs the row through PostgREST. A project-scoped check here would look
-- up a block_photos row that may not have arrived yet and deny the upload that
-- won the race.
--
-- What that buys back is small: object names are client-generated v4 UUIDs, and
-- a supervisor cannot enumerate the bucket because listing goes through the
-- SELECT policy above, which IS project-scoped.
create policy "supervisors upload photos"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'Testing'
    and public.get_current_user_role() = 3
  );

-- Delete. Role only, for the mirror image of the same race.
--
-- Deleting a photo removes the block_photos row through the CRUD queue and the
-- object through the attachment queue, independently. If the row lands first, a
-- project-scoped check finds nothing to correlate against and denies — and
-- onDeleteError returns true, so the queue retries forever against an object
-- that can now never be deleted. Confidentiality is held by SELECT; delete is an
-- availability concern.
create policy "supervisors delete photos"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'Testing'
    and public.get_current_user_role() = 3
  );

-- No UPDATE policy, deliberately. SupabaseRemoteStorageAdapter.uploadFile does
-- not pass `upsert`, and the queue's onUploadError treats "The resource already
-- exists" as non-retryable, so nothing in this app ever updates an object in
-- place. Adding one would widen access for a code path that does not exist.

-- ---------------------------------------------------------------------------
-- STEP 4 — enforcement. Run this ONLY after the spot checks below pass.
-- ---------------------------------------------------------------------------
--
-- Applied 2026-08-25, after STEPS 1-3 were verified by simulating every role.
-- Left live in the file rather than commented out, so re-running the file
-- reproduces the deployed state rather than half of it. If you are applying this
-- to a fresh project, comment these five lines out for the first pass, check the
-- spot checks, then uncomment and run again.
--
-- Until this runs, everything above is decoration: storage.objects carries
--
--   "Enable ALL for authenticated users only"  for all to authenticated
--     using (true) with check (true)
--
-- which grants every signed-in user read, write and delete on every object in
-- every bucket, and permissive policies combine with OR.
--
-- The four "folder 407ca8_*" policies dropped alongside it granted nothing: each
-- required `(storage.foldername(name))[1] = 'private'`, and objects are written
-- flat at the bucket root. They are dropped because they are misleading, not
-- because they were doing harm — reading the policy list, the bucket looked
-- scoped when it was not.
--
-- If this goes wrong, put the open policy back and photos work again while you
-- debug:
--
--   create policy "Enable ALL for authenticated users only" on storage.objects
--     for all to authenticated using (true) with check (true);

drop policy if exists "Enable ALL for authenticated users only" on storage.objects;
drop policy if exists "Give users authenticated access to folder 407ca8_0" on storage.objects;
drop policy if exists "Give users authenticated access to folder 407ca8_1" on storage.objects;
drop policy if exists "Give users authenticated access to folder 407ca8_2" on storage.objects;
drop policy if exists "Give users authenticated access to folder 407ca8_3" on storage.objects;

-- ---------------------------------------------------------------------------
-- Spot checks
-- ---------------------------------------------------------------------------
--
-- Simulate a caller without signing in. Read-only — it rolls back:
--
--   begin;
--   select set_config('request.jwt.claims',
--     '{"sub":"<user id>","role":"authenticated"}', true);
--   set local role authenticated;
--   select count(*) from public.block_photos;
--   rollback;
--
-- Expected: owner and admin see every photo; an assigned supervisor or viewer
-- sees the photos on their projects; an unassigned one sees none. Inserts must
-- fail with 42501 for everyone except an assigned supervisor.
--
-- The helper answers the Storage question directly, which is easier than going
-- through the Storage API:
--
--   select public.is_assigned_to_photo_object('<a live photo id>.jpg');  -- true
--   select public.is_assigned_to_photo_object('<an orphaned object>.jpg'); -- null
--
-- Orphaned objects — in the bucket with no block_photos row — become unreachable
-- by anyone once STEP 4 runs. Find and remove them:
--
--   select o.name from storage.objects o
--   where o.bucket_id = 'Testing'
--     and o.name <> '.emptyFolderPlaceholder'
--     and not exists (select 1 from public.block_photos bp
--                     where bp.id::text = split_part(o.name, '.', 1));
--
-- Remove them from the dashboard: Storage -> Testing -> select -> Delete.
--
-- NOT with `delete from storage.objects` — a SQL delete removes only the
-- metadata row and strands the actual file in the storage backend, still billed
-- and no longer referenced by anything.
--
-- And not with `pnpm sb storage rm ss:///Testing/<name>` either, however much it
-- looks like the right tool. On CLI 2.x it reports `{"deleted":[]}` with no
-- error and removes nothing, for objects sitting at the bucket root. Verified
-- 2026-08-25 that this is not an RLS refusal — it still no-ops with a wide-open
-- delete policy on the exact object. `pnpm sb storage ls ss:///Testing/` does
-- work (note the trailing slash; without it you get the bucket name back rather
-- than its contents), so the listing half of the tooling is fine.
--
-- Then the part no SQL can stand in for: on a device, as an assigned supervisor,
-- take a photo and watch it reach the bucket; reopen the block and see it
-- render; delete it and confirm both the row and the object go, with no
-- repeating delete errors in the log.

-- ---------------------------------------------------------------------------
-- What this does NOT control
-- ---------------------------------------------------------------------------
--
-- PowerSync's sync rules decide which rows actually reach a device. They live in
-- the PowerSync dashboard, not this repo, and they replicate through
-- powersync_role rather than through RLS — so a rule that sends every
-- block_photos row to every device will still do that, and the attachment queue
-- on a viewer's phone will still try to download files the policies above deny.
-- RLS governs writes and PostgREST reads. The sync rules have to agree with it.

-- ---------------------------------------------------------------------------
-- ADDENDUM (September 2026) — owners and admins can write block photos
-- ---------------------------------------------------------------------------
--
-- Same gap, and same reasoning, as the addendum in blocks.sql: every write
-- predicate here required `get_current_user_role() = 3`, so roles 1 and 2 could
-- view photos but not attach or remove them.
--
-- Photos make the silent-retry problem worse, not better. A photo exists only on
-- the device until the attachment queue uploads it, so a row the queue can never
-- insert is the one piece of data with no copy anywhere else.
--
-- Note this covers the block_photos table only. The Storage bucket has its own
-- policies, which key off is_assigned_to_photo_object() — if a manager still
-- cannot upload the file itself after this, that is the next place to look.

drop policy if exists "Owners and admins can manage all block photos" on public.block_photos;

create policy "Owners and admins can manage all block photos"
  on public.block_photos
  for all
  to authenticated
  using (public.get_current_user_role() in (1, 2))
  with check (public.get_current_user_role() in (1, 2));
