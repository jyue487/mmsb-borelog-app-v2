// blockPhotos.ts

import { supabase } from './supabase.server';

/**
 * The Storage bucket every block photo lives in. The bucket is dashboard state — it is
 * declared in no migration, no `config.toml` and no `createBucket` call — so there is no
 * shared constant to import. This is the third copy of the literal, alongside
 * `apps/mobile/src/storage/SupabaseRemoteStorageAdapter.ts` and the three occurrences in
 * `packages/supabase/policies/block_photos.sql`; they are kept in sync by hand.
 */
export const PHOTO_BUCKET = 'block-photos';

/**
 * PostgREST serialises `.in()` into the query string, so one request covering a deep
 * borehole would carry a few hundred UUIDs and push the URL past the ~8 KB header limit in
 * front of the API. Split the ids and issue the chunks in parallel instead.
 */
const BLOCK_IDS_PER_REQUEST = 100;

/**
 * A tab left open longer than this gets 403s on its `<img>` elements and has to be
 * reloaded. That is cheaper than tracking expiry and re-signing in the background, and an
 * hour is far longer than anyone reads a single borehole log.
 */
const SIGNED_URL_TTL_IN_SECONDS = 3600;

export type BlockPhoto = {
  id: string;
  blockId: string;
  signedUrl: string;
};

type BlockPhotoRow = {
  id: string;
  block_id: string;
  created_at: string | null;
};

function chunk<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];

  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }

  return chunks;
}

/**
 * PostgREST caps rows per response (1000 by default) and truncates *silently* — a short page is
 * indistinguishable from the end of the table. Chunking by block id does not bound this: one
 * chunk of 100 well-photographed blocks can carry more than a page between them. A missing page
 * is a few photos absent from a log, and, since deletePhotoObjects works from these same rows,
 * a few JPEGs left in the bucket with nothing left to find them by. So each chunk is paged.
 */
const PHOTO_ROWS_PER_PAGE = 1000;

/**
 * Chunking is by block id, so every photo of a given block comes back inside a single
 * chunk — the `created_at` ordering therefore still holds per block even though the
 * concatenation of the chunks is not globally sorted.
 */
async function fetchBlockPhotoRows(blockIds: string[]): Promise<BlockPhotoRow[]> {
  const responses = await Promise.all(
    chunk(blockIds, BLOCK_IDS_PER_REQUEST).map(async (blockIdChunk) => {
      const chunkRows: BlockPhotoRow[] = [];

      for (let offset = 0; ; offset += PHOTO_ROWS_PER_PAGE) {
        const { data, error } = await supabase
          .from('block_photos')
          .select('id, block_id, created_at')
          .in('block_id', blockIdChunk)
          // Defensive, not currently load-bearing, exactly as the `blocks` query in
          // BoreholePage is: CameraComponent removes a photo with a plain
          // `DELETE FROM block_photos`, so deleted_at is never populated and this matches
          // every row. See packages/supabase/policies/block_photos.sql.
          .is('deleted_at', null)
          .order('created_at', { ascending: true })
          // The tiebreak is what makes the paging sound rather than merely ordered: two
          // photos of the same block can share a `created_at`, and without a second key the
          // page boundary between them can repeat a row or skip one.
          .order('id', { ascending: true })
          .range(offset, offset + PHOTO_ROWS_PER_PAGE - 1);

        if (error) {
          throw error;
        }

        const page = data ?? [];
        chunkRows.push(...page);

        if (page.length < PHOTO_ROWS_PER_PAGE) {
          return chunkRows;
        }
      }
    }),
  );

  return responses.flat();
}

/**
 * Every photo of the given blocks, grouped by block id and ready to put in an `<img>`.
 *
 * Blocks with no photos are absent from the map rather than present with an empty array,
 * so callers should default with `?? []`.
 */
export async function fetchBlockPhotosByBlockIds(
  blockIds: string[],
): Promise<Map<string, BlockPhoto[]>> {
  const photosByBlockId = new Map<string, BlockPhoto[]>();

  if (blockIds.length === 0) {
    return photosByBlockId;
  }

  const rows = await fetchBlockPhotoRows(blockIds);

  if (rows.length === 0) {
    return photosByBlockId;
  }

  // The attachment queue writes files flat at the bucket root as `<block_photos.id>.jpg`
  // — PowerSync derives the object name from the row id — so the row id is the entire
  // storage key, with no project or borehole anywhere in the path.
  const { data: signedUrls, error } = await supabase.storage
    .from(PHOTO_BUCKET)
    .createSignedUrls(
      rows.map((row) => `${row.id}.jpg`),
      SIGNED_URL_TTL_IN_SECONDS,
    );

  if (error) {
    throw error;
  }

  const signedUrlByPath = new Map<string, string>();

  for (const result of signedUrls ?? []) {
    // A photo's row and its bytes travel over two independent queues with no ordering
    // guarantee, so a row whose object has not been uploaded yet fails on its own path
    // while the rest succeed. Drop that one photo rather than the whole borehole's worth.
    if (result.error !== null || result.path === null || result.signedUrl === null) {
      continue;
    }

    signedUrlByPath.set(result.path, result.signedUrl);
  }

  for (const row of rows) {
    const signedUrl = signedUrlByPath.get(`${row.id}.jpg`);

    if (signedUrl === undefined) {
      continue;
    }

    const photos = photosByBlockId.get(row.block_id);
    const photo: BlockPhoto = { id: row.id, blockId: row.block_id, signedUrl };

    if (photos === undefined) {
      photosByBlockId.set(row.block_id, [photo]);
    } else {
      photos.push(photo);
    }
  }

  return photosByBlockId;
}

/**
 * The storage keys of every photo belonging to the given blocks.
 *
 * Must be called BEFORE the rows are deleted. Storage does not cascade, but the rows do:
 * `block_photos.block_id -> blocks` and `blocks.borehole_id -> boreholes` are both
 * `ON DELETE CASCADE`, so deleting a borehole or a project removes every photo ROW and leaves
 * the JPEGs behind — billed, and unreachable the moment `is_assigned_to_photo_object()` stops
 * finding a row that owns them. That is the orphan class of `docs/follow-ups.md` item 0.
 *
 * The key is derived from the row and nowhere else, so once the rows are gone there is nothing
 * left to compute it from. Collecting the paths first is the only order that works.
 */
export async function fetchPhotoObjectPathsForBlocks(
  blockIds: string[],
): Promise<string[]> {
  if (blockIds.length === 0) {
    return [];
  }

  const rows = await fetchBlockPhotoRows(blockIds);

  return rows.map((row) => `${row.id}.jpg`);
}

/**
 * Removes photo objects from the bucket, and returns how many it could NOT remove.
 *
 * Only owners and admins can call this successfully: the bucket's delete policy is
 * `get_current_user_role() in (1, 2)` ("managers delete photos (block-photos)" in
 * packages/supabase/policies/block_photos.sql). Unlike a refused row delete, a refused object
 * delete does come back as an error.
 *
 * Counting rather than throwing, because callers reach here having already deleted the rows:
 * failing loudly would report a delete that did in fact happen as a failure. Stranded objects
 * are recoverable — `docs/follow-ups.md` item 0 has the query that finds them — where a row
 * pointing at bytes already destroyed would not be.
 *
 * A path that never existed is not counted. `remove` omits it from the result without erroring,
 * and a row whose bytes never finished uploading is a normal state here rather than a failure —
 * the row and the file travel over two independent queues.
 */
export async function deletePhotoObjects(paths: string[]): Promise<number> {
  let strandedCount = 0;

  // Chunked for a different reason than the reads above — these paths travel in a JSON body,
  // not the query string — but at the same size: it keeps one failing request from stranding
  // every photo of a deep borehole.
  for (const pathChunk of chunk(paths, BLOCK_IDS_PER_REQUEST)) {
    const { error } = await supabase.storage.from(PHOTO_BUCKET).remove(pathChunk);

    if (error) {
      console.error('Error removing block photo objects:', error);
      strandedCount += pathChunk.length;
    }
  }

  return strandedCount;
}
