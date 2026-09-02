import { Block } from '@mmsb/core';

/**
 * Depth first, then id.
 *
 * The id tiebreak is what makes the order reproducible. Blocks carry no stored sort
 * order, and ties on `topDepthInMetres` are normal in this domain — a permeability test
 * starts inside its host SPT's interval. `Array.prototype.sort` is stable, so without a
 * second key those ties keep whatever order the transport happened to return: on device
 * that is local rowid order over an unindexed PowerSync view, which changes on reinstall,
 * and on web it is whatever Postgres returned for a query with no ORDER BY. Two blocks of
 * the same type at the same depth would then trade indices between loads. `id` is the only
 * key that is total, non-null and identical on both clients — apps/web's
 * sortAndReindexAllBlocks uses the same pair. docs/follow-ups.md item 1.
 */
export function sortBlocks(blocks: Block[]): Block[] {
	return [...blocks].sort(
		(a, b) => a.topDepthInMetres - b.topDepthInMetres || a.id.localeCompare(b.id),
	);
}
