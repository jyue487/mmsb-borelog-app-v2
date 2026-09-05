-- Adds the checker sign-off to public.boreholes.
--
-- Reference SQL: run it by hand, or with
--
--   pnpm sb db query --linked -f supabase/migrations/2026-09-05-add-checker-signoff.sql
--
-- Safe to re-run.
--
-- ---------------------------------------------------------------------------
-- What this is for
-- ---------------------------------------------------------------------------
--
-- The report footer used to print a hardcoded name on its "Checked by:" line —
-- LOGGED_BY_NAME = 'IZWAN' in packages/report/src/model/input.ts, carried over
-- verbatim from the legacy HTML renderer. These three columns make the checker
-- a real person with their own signature and date, mirroring the verifier trio
-- that already exists beside them.
--
-- ---------------------------------------------------------------------------
-- Run this BEFORE shipping a client that writes the columns
-- ---------------------------------------------------------------------------
--
-- If a device uploads `checker_name` before the column exists, the Supabase
-- upsert errors and apps/mobile/src/powersync/Connector.ts rethrows rather than
-- calling transaction.complete() — which is what makes PowerSync retry, and
-- also what stalls every upload queued behind it on that device until the
-- column appears. Order: this file, then the app.
--
-- The PowerSync sync rules need no change: the boreholes bucket is `select *`,
-- so a new column reaches devices on its own. What a device actually stores is
-- whatever apps/mobile/src/powersync/AppSchema.ts declares, which also means a
-- build predating that file's checker columns keeps working untouched — it just
-- does not see them. There is no forced-upgrade cliff here.
--
-- No RLS change is needed: packages/supabase/policies/boreholes.sql grants on
-- the row, not per column, and the name-immutability trigger names only `name`.

alter table public.boreholes
  add column if not exists checker_name             text,
  add column if not exists checker_signature_base64 text,
  add column if not exists checker_sign_date        timestamptz;
