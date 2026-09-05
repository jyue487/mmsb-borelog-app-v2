import {
	END_OF_BOREHOLE_BLOCK_TYPE_ID,
	SPT_BLOCK_TYPE_ID,
	type Block,
	type BlockTypeId,
} from '@mmsb/core';

import { TICKS_PER_PAGE } from './constants';
import { MIN_PART_TICKS } from './pageGeometry';
import { collapsibleFollower } from './collapsePairs';

/**
 * Where each block lands: which page, at which tick, occupying how many ticks.
 *
 * This began as a transcription of the tick loop in
 * `apps/mobile/src/utils/pdf/generatePdfPages.ts:104-213`, with one structural change: the
 * old loop threaded a mutable one-element array (`scaleTickIndexWrapper`) through every
 * renderer, and `renderScaleTicksToHtml` was the only thing that incremented it. Rendering
 * therefore had a side effect on layout state, so a block could not be measured without
 * being drawn, and a speculative render corrupted the counter. Here the cursor is a local
 * `let tick` and nothing downstream can move it.
 *
 * **Page breaks have since deliberately diverged from the old loop.** It handled a block
 * that outgrew the space left on a page in two ways, and lost something either way: under
 * half fitting sent the block to the next page whole and left a blank strip behind, and half
 * or more fitting drew a truncated row and then *dropped the tail* — `blockIndex` advanced
 * regardless, so the remainder came back as a blank leading gap and the description simply
 * stopped mid-sentence. Now a block is split wherever it crosses the boundary and continues
 * on the next page, and it is moved whole only when what is left of the page could not hold
 * one line of anything (see `MIN_PART_TICKS`). `scripts/referenceOracle.ts` still carries the
 * old rule, so the oracle check recognises this divergence rather than failing on it — every
 * row keeps its startTick and tickCount, and only blank filler becomes a block part.
 */

export type PlacedRow =
	| {
			kind: 'block';
			block: Block;
			/** An in-situ test folded into this row; see collapsePairs.ts. */
			testBlock: Block | null;
			startTick: number;
			tickCount: number;
			/**
			 * 0 for a whole block, and for the first part of one split across a page break.
			 *
			 * A part after the first carries only the continuation of the description: the
			 * sample label, depths and blow counts print once, on part 0, because repeating
			 * them reads as a second sample at a second depth.
			 */
			partIndex: number;
			/** False when the block continues on the next page. */
			isFinalPart: boolean;
	  }
	| {
			kind: 'empty';
			/** Filler copies the previous block's column geometry (six SPT cells or three merged). */
			referenceBlockTypeId: BlockTypeId;
			startTick: number;
			tickCount: number;
	  };

export interface PageSlice {
	/** 1-based, matching the printed "SHEET n of N". */
	pageNumber: number;
	startTick: number;
	rows: PlacedRow[];
}

export type PaginationWarning =
	| { kind: 'negativeBlockHeight'; blockId: string; startTick: number }
	| { kind: 'pageBudgetExhausted'; pageNumber: number };

export interface PaginationResult {
	pages: PageSlice[];
	warnings: PaginationWarning[];
}

/**
 * A block's height is derived from where the NEXT row starts, not from its own base depth,
 * so any gap between blocks is absorbed into the block above it. Preserved verbatim,
 * including the three special cases:
 *
 *  - End of borehole: a hand-tuned minimum, then stretched to fill the rest of the page.
 *    `remarks.length / 30` is the original's text-measurement guess ("one tick per 30
 *    characters"). It survives here only to keep pagination identical; the drawing layer
 *    measures properly with font metrics.
 *  - Last block in the borehole: at least 10 ticks (1 m).
 *  - Everything else: up to the next block's top depth.
 */
function naturalHeightInTicks(
	block: Block,
	nextBlock: Block | null,
	tick: number,
	pageEndTick: number,
): number {
	if (block.blockTypeId === END_OF_BOREHOLE_BLOCK_TYPE_ID) {
		const remarksTicks = block.remarks.length === 0 ? 0 : 10 + block.remarks.length / 30;
		return Math.max(8 + remarksTicks, pageEndTick - tick);
	}
	if (nextBlock === null) {
		return Math.max(10, Math.round(block.baseDepthInMetres * 10) - tick);
	}
	return Math.round(nextBlock.topDepthInMetres * 10) - tick;
}

/** Depths are quantised to 0.1 m. `Math.round(x * 10)` throughout, as before. */
function tickOf(depthInMetres: number): number {
	return Math.round(depthInMetres * 10);
}

export function paginate(blocks: Block[]): PaginationResult {
	const pages: PageSlice[] = [];
	const warnings: PaginationWarning[] = [];

	// The old renderer indexed `blocks[blocks.length - 1]` unguarded, so an empty borehole
	// threw and surfaced as a raw `alert`. One blank page is the honest answer.
	if (blocks.length === 0) {
		return {
			pages: [
				{
					pageNumber: 1,
					startTick: 0,
					rows: [
						{
							kind: 'empty',
							referenceBlockTypeId: SPT_BLOCK_TYPE_ID,
							startTick: 0,
							tickCount: TICKS_PER_PAGE,
						},
					],
				},
			],
			warnings,
		};
	}

	let tick = 0;
	let blockIndex = 0;
	let pageNumber = 1;

	/**
	 * The tail of a block whose interval ran past the bottom of the previous page.
	 *
	 * `blockIndex` still points at that block — it is only consumed once its last part has
	 * been placed — so the carry holds what the next page cannot recompute: how much of the
	 * interval is left, and which part number comes next.
	 */
	let carry: { follower: Block | null; remainingTicks: number; partIndex: number } | null = null;

	while (blockIndex < blocks.length) {
		const pageStartTick = tick;
		const pageEndTick = pageNumber * TICKS_PER_PAGE;
		const rows: PlacedRow[] = [];

		const emit = (row: PlacedRow) => {
			if (row.tickCount > 0) {
				rows.push(row);
				tick += row.tickCount;
			}
		};

		if (carry === null) {
			// A gap before the first block on this page is padded so depth stays aligned to the ruler.
			const leadingGap = tickOf(blocks[blockIndex].topDepthInMetres) - tick;
			if (leadingGap > 0) {
				emit({
					kind: 'empty',
					referenceBlockTypeId:
						blocks[blockIndex > 0 ? blockIndex - 1 : blockIndex].blockTypeId,
					startTick: tick,
					tickCount: Math.min(leadingGap, pageEndTick - tick),
				});
			}
		} else {
			// Continue the block the last page ran out of room for. Its height is what was
			// left over, NOT `naturalHeightInTicks` — the cursor has moved past the top depth
			// that function measures from, so recomputing would measure the wrong interval.
			// No leading gap either, for the same reason: the page opens mid-block.
			const ticksAvailable = pageEndTick - tick;
			const isFinalPart = carry.remainingTicks <= ticksAvailable;
			const ticksToRender = Math.min(carry.remainingTicks, ticksAvailable);

			emit({
				kind: 'block',
				block: blocks[blockIndex],
				testBlock: carry.follower,
				startTick: tick,
				tickCount: ticksToRender,
				partIndex: carry.partIndex,
				isFinalPart,
			});

			if (isFinalPart) {
				blockIndex += carry.follower === null ? 1 : 2;
				carry = null;
			} else {
				// Taller than a whole page: keep going on the page after this one.
				carry = {
					follower: carry.follower,
					remainingTicks: carry.remainingTicks - ticksToRender,
					partIndex: carry.partIndex + 1,
				};
			}
		}

		while (carry === null && blockIndex < blocks.length && tick < pageEndTick) {
			const block = blocks[blockIndex];
			const follower = collapsibleFollower(block, blocks[blockIndex + 1] ?? null);

			// A folded pair consumes two blocks, so the row's height runs to the block AFTER
			// the follower.
			const effectiveNext = follower === null
				? (blocks[blockIndex + 1] ?? null)
				: (blocks[blockIndex + 2] ?? null);

			const rawHeight = naturalHeightInTicks(block, effectiveNext, tick, pageEndTick);

			// Out-of-order depths give a negative height. The old loop let that through: the
			// filler's trailing `++scaleTickIndexWrapper[0]` still fired, so the cursor crept
			// forward one tick per iteration while `blockIndex` never advanced — an unbounded
			// run of pages. Clamp and record it instead.
			const blockHeight = Math.max(0, rawHeight);
			if (rawHeight < 0) {
				warnings.push({ kind: 'negativeBlockHeight', blockId: block.id, startTick: tick });
			}

			const ticksAvailable = pageEndTick - tick;

			// What is left of the page could not hold one line of anything, so the block goes
			// to the next page whole rather than leaving a strip too short to print its own
			// sample label in. It is not consumed, so `naturalHeightInTicks` measures it again
			// from the new cursor and it still ends at the depth it should. This terminates:
			// a fresh page always has a full 90 ticks, which is far more than the minimum.
			if (blockHeight > ticksAvailable && ticksAvailable < MIN_PART_TICKS) {
				emit({
					kind: 'empty',
					referenceBlockTypeId:
						blocks[blockIndex > 0 ? blockIndex - 1 : blockIndex].blockTypeId,
					startTick: tick,
					tickCount: ticksAvailable,
				});
				break;
			}

			// End of borehole never splits. It is a terminator with `top === base`, so it has
			// no depth interval to divide; the height above is the old text-measurement guess
			// (`8 + remarks.length / 30`), which is not even a whole number of ticks. It fills
			// whatever is left of the page and the fitter sizes the remarks to suit — and if
			// what is left is under the minimum, the case above has already moved it.
			const isFinalPart =
				block.blockTypeId === END_OF_BOREHOLE_BLOCK_TYPE_ID || blockHeight <= ticksAvailable;
			const ticksToRender = Math.min(blockHeight, ticksAvailable);

			rows.push({
				kind: 'block',
				block,
				testBlock: follower,
				startTick: tick,
				tickCount: ticksToRender,
				partIndex: 0,
				isFinalPart,
			});
			tick += ticksToRender;

			if (!isFinalPart) {
				// Draw as much as fits here; the rest continues at the top of the next page.
				carry = { follower, remainingTicks: blockHeight - ticksToRender, partIndex: 1 };
				break;
			}

			blockIndex += follower === null ? 1 : 2;
		}

		// Blocks exhausted mid-page: fill down to the page boundary so the ruler still runs
		// the full 9 m.
		if (blockIndex >= blocks.length && tick < pageEndTick) {
			emit({
				kind: 'empty',
				referenceBlockTypeId: blocks[blocks.length - 1].blockTypeId,
				startTick: tick,
				tickCount: pageEndTick - tick,
			});
		}

		pages.push({ pageNumber, startTick: pageStartTick, rows });

		// The old loop assigned `scaleTickIndexWrapper[0] = pageIndex * 90` here, which
		// silently absorbed any drift between the ruler and the rows. If that assignment was
		// ever load-bearing the two had already diverged, so assert instead of assigning.
		if (tick !== pageEndTick) {
			warnings.push({ kind: 'pageBudgetExhausted', pageNumber });
			tick = pageEndTick;
		}
		pageNumber += 1;
	}

	return { pages, warnings };
}
