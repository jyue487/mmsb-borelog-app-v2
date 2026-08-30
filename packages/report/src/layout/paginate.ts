import {
	END_OF_BOREHOLE_BLOCK_TYPE_ID,
	SPT_BLOCK_TYPE_ID,
	type Block,
	type BlockTypeId,
} from '@mmsb/core';

import { TICKS_PER_PAGE } from './constants';
import { collapsibleFollower } from './collapsePairs';

/**
 * Where each block lands: which page, at which tick, occupying how many ticks.
 *
 * This is a transcription of the tick loop in
 * `apps/mobile/src/utils/pdf/generatePdfPages.ts:104-213`, with one structural change: the
 * old loop threaded a mutable one-element array (`scaleTickIndexWrapper`) through every
 * renderer, and `renderScaleTicksToHtml` was the only thing that incremented it. Rendering
 * therefore had a side effect on layout state, so a block could not be measured without
 * being drawn, and a speculative render corrupted the counter. Here the cursor is a local
 * `let tick` and nothing downstream can move it.
 */

export type PlacedRow =
	| {
			kind: 'block';
			block: Block;
			/** An in-situ test folded into this row; see collapsePairs.ts. */
			testBlock: Block | null;
			startTick: number;
			tickCount: number;
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

		while (blockIndex < blocks.length && tick < pageEndTick) {
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
			const ticksToRender = Math.min(blockHeight, ticksAvailable);

			// Less than half the block would fit, so push it to the next page and fill the
			// remainder. Note this check is deliberately NOT applied to folded pairs — the
			// original tested it only on the plain path, so a collapsed sample+test row can
			// still be split across a page break. Preserved to keep pagination identical.
			if (follower === null && ticksToRender < blockHeight / 2) {
				emit({
					kind: 'empty',
					referenceBlockTypeId:
						blocks[blockIndex > 0 ? blockIndex - 1 : blockIndex].blockTypeId,
					startTick: tick,
					tickCount: ticksAvailable,
				});
				break;
			}

			rows.push({
				kind: 'block',
				block,
				testBlock: follower,
				startTick: tick,
				tickCount: ticksToRender,
			});
			tick += ticksToRender;
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
