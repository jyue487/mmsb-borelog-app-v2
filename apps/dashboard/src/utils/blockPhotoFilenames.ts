import type { Block } from '@mmsb/core';

import type { BlockPhoto } from '../supabase/blockPhotos';
import { sanitiseFilename } from './sanitiseFilename';

// Photo filenames are `<projectCode>-<boreholeName>-<topDepth>-<baseDepth>-<N>.jpg`.
//
// N is scoped to the **depth interval**, not to the block: if an SPT at 5.000–5.000 has
// two photos and a falling-head test at the same 5.000–5.000 has two more, they number
// 1, 2, 3, 4 across both blocks. That is what makes the name unique without having to put
// the block symbol in it, and two blocks sharing an interval is routine — blockGutterSpec
// carries `hidesRepeatedBaseDepth` because `top === base` is normal for permeability
// tests, and packages/report has collapsePairs.ts for tests landing inside an SPT.
//
// This module is deliberately free of heavy imports so the gallery can pull the filenames
// in without also pulling in the zip chunk.

/** Depths are printed the way the log's gutter prints them, so names sort by depth. */
function intervalKeyOf(block: Block): string {
  return `${block.topDepthInMetres.toFixed(3)}-${block.baseDepthInMetres.toFixed(3)}`;
}

/**
 * Ordering blocks for numbering only.
 *
 * `sortBlocks` orders by `topDepthInMetres` alone and the `blocks` query issues no
 * `.order()`, so two blocks sharing an interval would otherwise fall in whatever order
 * Postgres happened to return them — and the same photo would be numbered differently
 * between page loads. Sorting a copy here keeps the numbering reproducible without
 * touching `sortAndReindexAllBlocks`, which is shared behaviour and drives the sample
 * labels shown on screen.
 */
function compareForNumbering(left: Block, right: Block): number {
  return (
    left.topDepthInMetres - right.topDepthInMetres ||
    left.baseDepthInMetres - right.baseDepthInMetres ||
    left.blockTypeId - right.blockTypeId ||
    left.id.localeCompare(right.id)
  );
}

/**
 * The download filename for every photo of the borehole, keyed by photo id.
 *
 * Photos of a block keep the order `fetchBlockPhotosByBlockIds` returned them in, which is
 * `created_at` ascending.
 */
export function buildPhotoFilenames(
  projectCode: string,
  boreholeName: string,
  blocks: Block[],
  photosByBlockId: Map<string, BlockPhoto[]>,
): Map<string, string> {
  const prefix = `${sanitiseFilename(projectCode)}-${sanitiseFilename(boreholeName)}`;
  const filenames = new Map<string, string>();
  const countByInterval = new Map<string, number>();

  for (const block of [...blocks].sort(compareForNumbering)) {
    const photos = photosByBlockId.get(block.id);

    if (photos === undefined) {
      continue;
    }

    const interval = intervalKeyOf(block);

    for (const photo of photos) {
      const n = (countByInterval.get(interval) ?? 0) + 1;

      countByInterval.set(interval, n);
      filenames.set(photo.id, `${prefix}-${interval}-${n}.jpg`);
    }
  }

  return filenames;
}

/**
 * Turns a signed URL into one the browser will save under `filename`.
 *
 * Storage treats `download` as an ordinary query parameter that storage-js appends on the
 * client *after* the token is issued, so it is not covered by the signature and can be
 * added to a URL that was signed without it. The response then carries
 * `Content-Disposition: attachment`, which is what actually names the file — the `<a
 * download>` attribute is ignored for a cross-origin href.
 */
export function buildDownloadUrl(signedUrl: string, filename: string): string {
  const url = new URL(signedUrl);

  url.searchParams.set('download', filename);

  return url.toString();
}
