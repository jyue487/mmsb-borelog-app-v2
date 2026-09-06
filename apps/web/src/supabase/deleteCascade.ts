// deleteCascade.ts
//
// Deleting a borehole, and deleting a whole project. Both are owner/admin only, both are
// irreversible, and both are more than a `.delete()` call for two reasons that pull in
// opposite directions.
//
// ROWS CASCADE. Every foreign key in the public schema is `ON DELETE CASCADE` —
// `block_photos.block_id -> blocks`, `blocks.borehole_id -> boreholes`,
// `boreholes.project_id -> projects`, `project_to_user.project_id -> projects` (the full table
// is in docs/follow-ups.md item 0, taken from pg_constraint). So one delete removes the whole
// subtree of rows and nothing has to walk it.
//
// STORAGE DOES NOT. A photo's object key is `<block_photos.id>.jpg` at the bucket root, and a
// site plan's is `site-plans/<projects.id>.pdf`; neither is a row, so neither goes with the
// cascade. Both functions here collect the keys first and remove the objects afterwards,
// because after the cascade there is no row left to derive a photo key from.
//
// The order of those two steps is the whole design, and it is not the obvious one. Purging
// storage first would mean that an RLS refusal — the likely failure, and a SILENT one, because
// Postgres applies a delete policy as a row filter and returns 200 having matched nothing —
// destroys every photo of a borehole that still exists. Deleting the row first proves the
// permission before anything irreversible happens to the bytes. What is left if the second half
// fails is orphaned objects: billed and unreachable, but recoverable with the query in
// docs/follow-ups.md item 0, and never a row pointing at a file that is already gone.

import {
  deletePhotoObjects,
  fetchPhotoObjectPathsForBlocks,
} from './blockPhotos';
import { deleteSitePlan } from './sitePlan';
import { supabase } from './supabase.server';

/**
 * `strandedPhotoCount` is the number of photo files the delete could not remove from the
 * bucket. The rows are gone either way — this is a note for the user, not a failure.
 */
export type DeleteResult = {
  strandedPhotoCount: number;
};

/**
 * What a delete that RLS refused looks like from here: nothing.
 *
 * `saveProjectPeople` in projectPeople.ts carries the long version. In short, a delete no
 * policy admits is not an error — the statement succeeds having matched zero rows and PostgREST
 * returns 200 — so asking for the deleted rows back is the only way to tell a refusal from a
 * success. It is also why mobile's borehole delete button was removed rather than fixed
 * (apps/mobile/src/app/project/[id].tsx).
 */
const REFUSED_MESSAGE =
  'could not be deleted — you may not have permission to delete it. ' +
  'Reload the page to see the current list.';

/**
 * PostgREST caps rows per response (1000 by default) and truncates silently, so a short page is
 * indistinguishable from the end of the table. A project runs past 1000 blocks at a handful of
 * well-logged boreholes — `docs/follow-ups.md` records the same cap biting
 * `fetchBlocksByBoreholeIds` — and here an unread page means the photos of every block in it are
 * never collected, so they strand in the bucket after the cascade removes their rows. Paged, in
 * the shape `fetchBoreholeStatuses.ts` uses.
 */
const BLOCK_IDS_PER_PAGE = 1000;

/** Block ids only. The full rows carry a JSON payload each, and none of it is wanted here. */
async function fetchBlockIdsByBoreholeIds(
  boreholeIds: string[],
): Promise<string[]> {
  if (boreholeIds.length === 0) {
    return [];
  }

  const blockIds: string[] = [];

  for (let offset = 0; ; offset += BLOCK_IDS_PER_PAGE) {
    const { data, error } = await supabase
      .from('blocks')
      .select('id')
      .in('borehole_id', boreholeIds)
      // A stable order is what makes the paging sound; without it two pages can overlap or
      // skip rows.
      .order('id', { ascending: true })
      .range(offset, offset + BLOCK_IDS_PER_PAGE - 1);

    if (error) {
      throw error;
    }

    const page = data ?? [];
    blockIds.push(...page.map((row) => row.id as string));

    if (page.length < BLOCK_IDS_PER_PAGE) {
      return blockIds;
    }
  }
}

/**
 * Deletes a borehole, its blocks, their photo rows and their photo files.
 *
 * The blocks and photo rows go by cascade rather than by explicit deletes. That used to be the
 * objection to building this at all (docs/follow-ups.md, "Deleting a borehole on web"): the
 * cascade runs as the table owner and bypasses RLS, so it deleted children the caller was
 * denied directly. The September 2026 addenda to blocks.sql and block_photos.sql gave owners
 * and admins `for all` on both, so the cascade no longer does anything the caller could not
 * do themselves, and the objection is spent.
 */
export async function deleteBoreholeAndContents(
  boreholeId: string,
): Promise<DeleteResult> {
  const blockIds = await fetchBlockIdsByBoreholeIds([boreholeId]);
  const photoPaths = await fetchPhotoObjectPathsForBlocks(blockIds);

  const { data: deletedRows, error } = await supabase
    .from('boreholes')
    .delete()
    .eq('id', boreholeId)
    .select('id');

  if (error) {
    throw error;
  }

  if ((deletedRows ?? []).length === 0) {
    throw new Error(`This borehole ${REFUSED_MESSAGE}`);
  }

  return { strandedPhotoCount: await deletePhotoObjects(photoPaths) };
}

/**
 * Deletes a project and everything under it: its boreholes, their blocks, every photo row and
 * file, the project's site plan, and the `project_to_user` assignments.
 *
 * The assignments go by cascade too, which is the one place this bypasses a policy the caller
 * does not separately hold — but owners and admins have `for all` on `project_to_user` as well
 * (project_to_user.sql), so the same reasoning applies.
 */
export async function deleteProjectAndContents(
  projectId: string,
): Promise<DeleteResult> {
  const { data: boreholeRows, error: boreholeError } = await supabase
    .from('boreholes')
    .select('id')
    .eq('project_id', projectId);

  if (boreholeError) {
    throw boreholeError;
  }

  const boreholeIds = (boreholeRows ?? []).map((row) => row.id as string);
  const blockIds = await fetchBlockIdsByBoreholeIds(boreholeIds);
  const photoPaths = await fetchPhotoObjectPathsForBlocks(blockIds);

  const { data: deletedRows, error } = await supabase
    .from('projects')
    .delete()
    .eq('id', projectId)
    .select('id');

  if (error) {
    throw error;
  }

  if ((deletedRows ?? []).length === 0) {
    throw new Error(`This project ${REFUSED_MESSAGE}`);
  }

  const strandedPhotoCount = await deletePhotoObjects(photoPaths);

  // Last, and deliberately not fatal. The plan is an object with no row anywhere — its key is
  // derived from the project id, which is why it can be removed after the project is gone —
  // and most projects never have one, so `remove` no-oping on a missing object is the common
  // case rather than an edge one. A failure here strands one PDF, which the query in
  // packages/supabase/policies/documents.sql finds.
  try {
    await deleteSitePlan(projectId);
  } catch (error) {
    console.error('Error removing the site plan of a deleted project:', error);
  }

  return { strandedPhotoCount };
}
