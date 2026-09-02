// sitePlan.ts
//
// The site plan: the borehole location drawing the client supplies as a PDF, one
// per project. Read and written from the dashboard only — mobile has no site
// plan feature.

import { supabase } from './supabase.server';

/**
 * The Storage bucket project documents live in. Deliberately not `Testing`, which
 * holds block photos: the policies on that bucket assume every object in it is a
 * block photo, and a PDF would break the assumption. See
 * `packages/supabase/policies/documents.sql`.
 *
 * Like PHOTO_BUCKET in `blockPhotos.ts`, the bucket is dashboard state rather
 * than anything a migration declares, so the literal is kept in sync by hand with
 * the occurrences in `documents.sql`.
 */
const DOCUMENT_BUCKET = 'documents';

/**
 * Long enough to open the PDF in a new tab and read it; short because the URL is
 * minted on click rather than on page load, so nothing holds one for long.
 */
const SIGNED_URL_TTL_IN_SECONDS = 300;

/**
 * The single place the key layout is written down. The project id being *in* the
 * key is what lets a site plan exist with no row in Postgres — the RLS predicate
 * in `documents.sql` parses the project back out of this exact shape, so the two
 * change together or a plan becomes unreadable.
 *
 * The `site-plans/` prefix is load-bearing: the write policies require it, so an
 * object written anywhere else in the bucket is rejected.
 */
export function sitePlanPath(projectId: string): string {
  return `site-plans/${projectId}.pdf`;
}

/**
 * Storage reports a missing object as an ordinary error rather than an empty
 * result, and a plan simply not having been uploaded is the common case — most
 * projects will never have one. So the not-found error is translated to `null`
 * and everything else still throws.
 *
 * Matched on the message rather than a status code because storage-js types the
 * error as a bare `StorageError` with no status on the union, and the HTTP status
 * is only present on some of its subclasses.
 */
function isObjectNotFound(error: { message: string }): boolean {
  return /not found/i.test(error.message);
}

/**
 * A URL for the project's site plan, or `null` if it has none.
 *
 * Call this on click, not on page load: signed URLs expire, and one minted when
 * the page opened may be dead by the time someone presses the button.
 *
 * One round trip. Listing the folder and filtering would cost two and answer the
 * same question, because a signed URL for an object that is missing — or that RLS
 * hides — fails either way.
 */
export async function fetchSitePlanUrl(
  projectId: string,
): Promise<string | null> {
  const { data, error } = await supabase.storage
    .from(DOCUMENT_BUCKET)
    .createSignedUrl(sitePlanPath(projectId), SIGNED_URL_TTL_IN_SECONDS);

  if (error) {
    if (isObjectNotFound(error)) {
      return null;
    }

    throw error;
  }

  return data.signedUrl;
}

/**
 * What the panel needs to know about a project's site plan, beyond the fact that
 * one exists. Declared here rather than reusing storage-js's `FileObject`,
 * because that type reaches us only as a transitive dependency of
 * `@supabase/supabase-js` — nothing in apps/web/package.json names it.
 *
 * Both fields are nullable because Storage types them that way: `list` returns
 * the same row shape for folders, where neither is populated.
 */
export type SitePlan = {
  updatedAt: Date | null;
  sizeInBytes: number | null;
};

/**
 * The project's site plan, or `null` if it has none.
 *
 * A page-load question, unlike the URL itself: it decides what the panel offers —
 * "View" against "Not uploaded" — and what it says about the file.
 *
 * `list` with the project's own filename as the search term rather than a bare
 * folder listing: the folder holds one object per project across the whole
 * organisation, and a manager can read all of them.
 *
 * The date and size come out of the same response. Storage returns them on the
 * listing row, so showing them costs nothing beyond the call already being made,
 * and no signed URL has to be minted to find them out.
 */
export async function fetchSitePlan(
  projectId: string,
): Promise<SitePlan | null> {
  const { data, error } = await supabase.storage
    .from(DOCUMENT_BUCKET)
    .list('site-plans', { search: `${projectId}.pdf`, limit: 1 });

  if (error) {
    throw error;
  }

  // `search` is a prefix match rather than an exact one, so confirm the name.
  const file = (data ?? []).find((entry) => entry.name === `${projectId}.pdf`);

  if (!file) {
    return null;
  }

  return {
    updatedAt: file.updated_at === null ? null : new Date(file.updated_at),
    sizeInBytes: file.metadata?.size ?? null,
  };
}

/**
 * Uploads the project's site plan, replacing any existing one.
 *
 * `upsert` is what makes reissuing a revised drawing work, and it is why
 * `documents.sql` carries an UPDATE policy where the photo bucket deliberately
 * does not — an upsert over an existing key is an UPDATE, not an INSERT.
 *
 * `cacheControl: '0'` because the key never changes. With Storage's default of an
 * hour, someone who replaced a plan would keep being handed the old one until the
 * cache expired, with nothing to indicate why.
 */
export async function uploadSitePlan(
  projectId: string,
  file: File,
): Promise<void> {
  const { error } = await supabase.storage
    .from(DOCUMENT_BUCKET)
    .upload(sitePlanPath(projectId), file, {
      upsert: true,
      contentType: 'application/pdf',
      cacheControl: '0',
    });

  if (error) {
    throw error;
  }
}

/**
 * Removes the project's site plan.
 *
 * `remove` reports a missing object by returning an empty array rather than an
 * error, so removing a plan that is already gone is a no-op — which is what the
 * caller wants after two people press the button.
 */
export async function deleteSitePlan(projectId: string): Promise<void> {
  const { error } = await supabase.storage
    .from(DOCUMENT_BUCKET)
    .remove([sitePlanPath(projectId)]);

  if (error) {
    throw error;
  }
}
