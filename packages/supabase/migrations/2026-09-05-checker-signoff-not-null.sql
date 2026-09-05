-- Makes public.boreholes.checker_name and .checker_signature_base64 behave like the
-- verifier columns they were meant to mirror: NOT NULL, defaulting to ''.
--
-- Reference SQL: run it by hand, or with
--
--   pnpm sb db query --linked -f supabase/migrations/2026-09-05-checker-signoff-not-null.sql
--
-- Safe to re-run.
--
-- ---------------------------------------------------------------------------
-- What this is for
-- ---------------------------------------------------------------------------
--
-- 2026-09-05-add-checker-signoff.sql said the three columns mirror "the verifier
-- trio that already exists beside them". They did not: it added them as plain
-- nullable text with no default and no backfill, where driller_name, verifier_name
-- and verifier_signature_base64 are all `not null default ''`.
--
-- packages/core/src/interfaces/Borehole.ts declares checkerName and
-- checkerSignatureBase64 as non-nullable `string`, so every row predating that
-- migration read back as null through a type that promised otherwise, and
-- apps/mobile/src/utils/pdf/sharePdf.ts threw "cannot read property 'length' of
-- null" the moment anyone shared a PDF for one.
--
-- ---------------------------------------------------------------------------
-- Why the default matters as much as the backfill
-- ---------------------------------------------------------------------------
--
-- The nulls are not only historical. apps/web/src/components/AddBulkBoreholesModal.tsx
-- inserts the verifier columns and omits the checker ones entirely, so a backfill
-- on its own would be undone by the next bulk add. `default ''` closes that with no
-- change to the dashboard: an insert that omits the column now lands as ''.
--
-- checker_sign_date is deliberately left nullable. It is a timestamp, read through
-- `toDate()`, which is this repo's convention for a nullable timestamp -- and
-- `new Date(null)` being the epoch is exactly the bug docs/follow-ups.md item 3
-- records. Only the two text columns were wrong.
--
-- ---------------------------------------------------------------------------
-- Ordering
-- ---------------------------------------------------------------------------
--
-- Backfill first: `set not null` fails while any row still holds one. The update
-- replicates to devices through PowerSync like any other write -- the boreholes
-- bucket is `select *` -- but a device that has not synced since still holds the
-- null locally, which is why the two mobile read paths coalesce as well rather
-- than relying on this file alone.
--
-- No RLS change: policies/boreholes.sql grants on the row, not per column.

update public.boreholes set checker_name             = '' where checker_name             is null;
update public.boreholes set checker_signature_base64 = '' where checker_signature_base64 is null;

alter table public.boreholes
  alter column checker_name             set default '',
  alter column checker_name             set not null,
  alter column checker_signature_base64 set default '',
  alter column checker_signature_base64 set not null;
