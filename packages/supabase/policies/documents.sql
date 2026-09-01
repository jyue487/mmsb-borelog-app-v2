-- Row level security for project documents: the objects in the `documents`
-- Storage bucket.
--
-- Today the bucket holds exactly one kind of object, the **site plan** — the
-- borehole location drawing the client supplies as a PDF, one per project, shown
-- by the "Site Plan" control on the web ProjectPage.
--
-- Unlike packages/supabase/policies/block_photos.sql, there is no table half to
-- keep in step. A site plan is *only* an object: its key is derived from the
-- project id, so nothing in Postgres records that it exists. That is deliberate
-- — see "Why the path carries the project id" below.
--
-- Reference SQL: run it by hand, or with
--
--   pnpm sb db query --linked -f supabase/policies/documents.sql
--
-- Safe to re-run — the bucket upsert is idempotent and every policy is dropped
-- by name before it is created.
--
-- Role ids, from public.roles: 1 = owner, 2 = admin, 3 = supervisor, 4 = viewer.
--
-- ---------------------------------------------------------------------------
-- A second bucket, rather than reusing `Testing`
-- ---------------------------------------------------------------------------
--
-- `Testing` holds block photos, and its policies encode the assumption that
-- **every object in it is a block photo**: is_assigned_to_photo_object(name) in
-- block_photos.sql resolves an object name back to a block_photos row, and
-- returns NULL — deny — for anything it cannot. Putting a PDF in there would
-- make that assumption false and force an OR branch into a predicate written
-- carefully for one job.
--
-- A separate bucket leaves the photo policies untouched and lets this one have
-- its own four-policy set. The two buckets never appear in the same policy.
--
-- ---------------------------------------------------------------------------
-- This writes to another schema. Check it landed.
-- ---------------------------------------------------------------------------
--
-- storage.buckets and storage.objects are owned by supabase_storage_admin, and
-- `pnpm sb` connects as `postgres`, which is not a member of that role and is
-- not a superuser. It worked anyway when the photo policies were first applied
-- (2026-08-25) — postgres holds enough privilege on the managed platform — but
-- if STEP 1 or STEP 3 fails with "must be owner of table objects", run that step
-- from the dashboard's SQL editor, or build the bucket in Storage -> Buckets and
-- the policies in Storage -> Policies.
--
--   select policyname, cmd from pg_policies
--   where schemaname = 'storage' and policyname like '%site plan%';
--
-- Note what is NOT needed here, and was for the photos: there is no wide-open
-- policy left to drop. STEP 4 of block_photos.sql already removed
-- "Enable ALL for authenticated users only", which spanned every bucket. So
-- storage.objects is deny-by-default and a freshly created `documents` bucket is
-- unreachable by everyone until STEP 3 below runs. Creating the bucket first and
-- the policies second cannot leak anything.

-- ---------------------------------------------------------------------------
-- STEP 1 — the bucket
-- ---------------------------------------------------------------------------
--
-- Private. Reads go through createSignedUrl, exactly as the photos do, so that
-- RLS is what decides who sees a plan rather than knowledge of a URL.
--
-- The MIME restriction is a guard against the wrong file being picked, not a
-- security control — Storage takes the content type from the client. The web
-- uploader sends `application/pdf` explicitly; see
-- apps/web/src/supabase/sitePlan.ts.
--
-- 25 MB, because a site plan is a scanned or exported CAD drawing rather than a
-- text PDF and routinely runs to several megabytes.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('documents', 'documents', false, 26214400, array['application/pdf'])
on conflict (id) do update
  set public            = excluded.public,
      file_size_limit   = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- ---------------------------------------------------------------------------
-- STEP 2 — the helper
-- ---------------------------------------------------------------------------
--
-- Why the path carries the project id
-- -----------------------------------
--
-- The key is `site-plans/<projects.id>.pdf`, written in exactly one place —
-- sitePlanPath() in apps/web/src/supabase/sitePlan.ts. Because the project id is
-- *in* the key, "which project does this object belong to?" is answered without
-- a row anywhere, which is what lets the whole feature ship with no migration.
--
-- This makes the predicate a **path parse**, and block_photos.sql:124 explicitly
-- calls a path parse out as the thing it avoided. That warning was earned in a
-- different situation: the attachment queue mints flat UUID names on a device,
-- outside the app's control, with no project anywhere in them. Here the key is
-- constructed by one function, in one file, at one call site, and the parse is
-- the direct expression of it. The lesson was not missed; it does not apply.
--
-- `exists` rather than the NULL-returning shape of is_assigned_to_photo_object:
-- there is no intermediate row to look up and therefore no orphan case to
-- distinguish. `false` and NULL both deny.
--
-- The comparison is text-to-text (`pu.project_id::text = ...`) rather than a
-- cast of the parsed segment to uuid, for the same reason the photo helper uses
-- split_part: a malformed name must miss, not raise an invalid-input error from
-- inside a policy.
--
-- `security definer` is not optional, for the reason given at blocks.sql:61 —
-- RLS applies to tables named inside a policy expression, so an inline subquery
-- would silently couple this to whatever policies project_to_user happens to
-- carry, failing as an empty result rather than an error. Nor is
-- `set search_path`: a security definer function without a pinned search_path is
-- a privilege escalation vector, and Supabase's linter flags it.
create or replace function public.is_assigned_to_site_plan_object(object_name text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.project_to_user pu
    where split_part(object_name, '/', 1) = 'site-plans'
      and pu.project_id::text = split_part(split_part(object_name, '/', 2), '.', 1)
      and pu.user_id = auth.uid()
  )
$$;

-- ---------------------------------------------------------------------------
-- STEP 3 — storage.objects
-- ---------------------------------------------------------------------------
--
--                              select              insert / update / delete
--   owner (1) / admin (2)      every object        yes
--   supervisor (3)             assigned projects   no
--   viewer (4)                 assigned projects   no
--
-- The bucket name is hardcoded, matching the literal in
-- apps/web/src/supabase/sitePlan.ts. One bucket, one constant on each side, kept
-- in sync by hand — the same arrangement as `Testing`.

drop policy if exists "site plans readable by managers and assigned members" on storage.objects;
drop policy if exists "managers upload site plans" on storage.objects;
drop policy if exists "managers replace site plans" on storage.objects;
drop policy if exists "managers delete site plans" on storage.objects;

-- Read.
--
-- The role branch comes first and is a bypass, not a narrowing: an owner or
-- admin generally holds **no project_to_user row at all** — their access comes
-- from their role — so without it the people who upload a plan could not read it
-- back. Same shape as the photo read policy.
create policy "site plans readable by managers and assigned members"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'documents'
    and (
      public.get_current_user_role() in (1, 2)
      or public.is_assigned_to_site_plan_object(name)
    )
  );

-- Write — insert, update, delete. Role only, plus a prefix guard.
--
-- **Not** scoped to the object's project, and this is the one place the write
-- rules deliberately differ from what "project-scoped writes" would suggest.
-- Only roles 1 and 2 may write, and those are exactly the roles that hold no
-- assignment row; requiring is_assigned_to_site_plan_object() here would deny
-- every upload the feature exists to allow. Assignment scoping is meaningful on
-- read, where roles 3 and 4 reach the policy, and meaningless on write, where
-- they never do.
--
-- What the `site-plans/` guard buys instead is containment: a manager's client
-- cannot put an object anywhere else in the bucket, so a second kind of document
-- added later gets its own prefix and its own policies rather than inheriting
-- these by accident.
--
-- There IS an update policy, where block_photos.sql deliberately has none.
-- Reissuing a revised plan overwrites the same key through `upsert: true`, and
-- that is an UPDATE. The photos' reason for omitting it — that nothing in the
-- app updates an object in place — is simply not true here.
create policy "managers upload site plans"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'documents'
    and name like 'site-plans/%'
    and public.get_current_user_role() in (1, 2)
  );

create policy "managers replace site plans"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'documents'
    and name like 'site-plans/%'
    and public.get_current_user_role() in (1, 2)
  )
  with check (
    bucket_id = 'documents'
    and name like 'site-plans/%'
    and public.get_current_user_role() in (1, 2)
  );

create policy "managers delete site plans"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'documents'
    and name like 'site-plans/%'
    and public.get_current_user_role() in (1, 2)
  );

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
--   select name from storage.objects where bucket_id = 'documents';
--   rollback;
--
-- Expected: owner and admin see every site plan; a supervisor or viewer assigned
-- to project A sees A's plan and not B's; an unassigned one sees none.
--
-- The helper answers the question directly, which is easier than going through
-- the Storage API. Run it inside the same simulated session:
--
--   select public.is_assigned_to_site_plan_object('site-plans/<an assigned project id>.pdf');   -- true
--   select public.is_assigned_to_site_plan_object('site-plans/<an unassigned project id>.pdf'); -- false
--   select public.is_assigned_to_site_plan_object('site-plans/.emptyFolderPlaceholder');        -- false, not an error
--   select public.is_assigned_to_site_plan_object('<a project id>.pdf');                        -- false: no prefix
--
-- Note the last two. The third is the malformed-name case the text comparison
-- exists for; the fourth confirms an object at the bucket root is unreachable
-- rather than accidentally matching.
--
-- Writes must fail with 42501 for supervisors and viewers and succeed for owners
-- and admins. Simulating an insert against storage.objects directly does not
-- exercise the Storage API's own checks, so the check that counts is the one
-- through the app — see step 3 of the verification in the plan.
--
-- Then the part no SQL can stand in for: as an owner on the dashboard, upload a
-- plan and open it; sign in as a supervisor assigned to that project and open
-- it; sign in as one who is not and confirm the control is absent.

-- ---------------------------------------------------------------------------
-- What this does NOT control
-- ---------------------------------------------------------------------------
--
-- Mobile. The field app has no site plan feature — it would need the PowerSync
-- attachment queue rather than a direct upload — so nothing on a device reads
-- this bucket, and PowerSync's sync rules have no bucket to agree with here.
-- That changes the day a plan is shown in the field.
--
-- Orphans. A project deleted from Postgres leaves its plan in the bucket, and
-- is_assigned_to_site_plan_object then matches nothing, so the object becomes
-- unreachable by roles 3 and 4 while owners and admins can still list it. There
-- is no cascade — the object is not a row. Find them with:
--
--   select o.name from storage.objects o
--   where o.bucket_id = 'documents'
--     and o.name like 'site-plans/%'
--     and not exists (
--       select 1 from public.projects p
--       where p.id::text = split_part(split_part(o.name, '/', 2), '.', 1));
--
-- Remove them from the dashboard: Storage -> documents -> select -> Delete.
-- NOT with `delete from storage.objects`, which removes only the metadata row
-- and strands the file in the storage backend, still billed and referenced by
-- nothing. And not with `pnpm sb storage rm` either — on CLI 2.x it reports
-- `{"deleted":[]}` and removes nothing. Both traps are documented at length in
-- block_photos.sql; they are properties of the tooling, not of the bucket.
