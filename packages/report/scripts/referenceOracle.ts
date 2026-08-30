/**
 * A deliberately literal transliteration of the OLD tick loop, used only to check that
 * `paginate()` is a faithful restructuring of it.
 *
 * paginate.ts is a *restructured* version — local cursor, explicit rows, clamped heights.
 * This is a *transcription* — it keeps the mutable one-element wrapper, the `continue`
 * that does not advance blockIndex, and the exact side effects of the two renderers that
 * moved the cursor. If the two agree on every fixture, the restructuring did not change
 * behaviour; where they disagree, the disagreement should be one of the bugs we set out to
 * fix, and nothing else.
 *
 * Source: apps/mobile/src/utils/pdf/generatePdfPages.ts:104-213
 */
import {
	CONSTANT_HEAD_PERMEABILITY_TEST_BLOCK_TYPE_ID,
	CORING_BLOCK_TYPE_ID,
	END_OF_BOREHOLE_BLOCK_TYPE_ID,
	FALLING_HEAD_PERMEABILITY_TEST_BLOCK_TYPE_ID,
	LUGEON_TEST_BLOCK_TYPE_ID,
	RISING_HEAD_PERMEABILITY_TEST_BLOCK_TYPE_ID,
	SPT_BLOCK_TYPE_ID,
	UD_BLOCK_TYPE_ID,
	type Block,
} from '@mmsb/core';

export interface OracleRow {
	label: string;
	startTick: number;
	tickCount: number;
}

/**
 * renderScaleTicksToHtml increments the wrapper (n - 1) times in its loop and then once
 * more unconditionally — so it advances by n for n >= 1, but by 1 for n <= 0. That
 * trailing increment is what made a negative height creep forward instead of terminating.
 */
function advanceScaleTicks(n: number, w: number[]): number {
	const before = w[0];
	for (let i = 0; i < n - 1; ++i) {
		++w[0];
	}
	++w[0];
	return w[0] - before;
}

/** renderEmptyBlockToHtml early-returns for exactly 0 ticks, so the cursor does not move. */
function renderEmpty(n: number, w: number[], rows: OracleRow[]): void {
	if (n === 0) {
		return;
	}
	const start = w[0];
	const advanced = advanceScaleTicks(n, w);
	rows.push({ label: '(filler)', startTick: start, tickCount: advanced });
}

const PERM = [
	FALLING_HEAD_PERMEABILITY_TEST_BLOCK_TYPE_ID,
	RISING_HEAD_PERMEABILITY_TEST_BLOCK_TYPE_ID,
	CONSTANT_HEAD_PERMEABILITY_TEST_BLOCK_TYPE_ID,
] as const;

export function paginateOracle(blocks: Block[], maxPages = 200): { rows: OracleRow[]; pages: number; ranAway: boolean } {
	const w = [0];
	const rows: OracleRow[] = [];
	let pageIndex = 1;
	let blockIndex = 0;
	let ranAway = false;

	const specialCase = (block: Block, next: Block | null, nextNext: Block | null): Block | null => {
		if (next === null || !(next.topDepthInMetres < block.baseDepthInMetres)) return null;
		if (block.blockTypeId === SPT_BLOCK_TYPE_ID && (PERM as readonly number[]).includes(next.blockTypeId)) return next;
		if (block.blockTypeId === UD_BLOCK_TYPE_ID && (PERM as readonly number[]).includes(next.blockTypeId)) return next;
		if (block.blockTypeId === CORING_BLOCK_TYPE_ID && next.blockTypeId === LUGEON_TEST_BLOCK_TYPE_ID) return next;
		return null;
	};

	while (blockIndex < blocks.length) {
		if (pageIndex > maxPages) {
			ranAway = true;
			break;
		}

		// --- renderBlocksToHtml() ---
		if (Math.round(blocks[blockIndex].topDepthInMetres * 10) - w[0] > 0) {
			renderEmpty(Math.round(blocks[blockIndex].topDepthInMetres * 10) - w[0], w, rows);
		}
		while (blockIndex < blocks.length) {
			if (w[0] === pageIndex * 90) break;

			const block = blocks[blockIndex];
			const next = blocks[blockIndex + 1] ?? null;
			const nextNext = blocks[blockIndex + 2] ?? null;

			const folded = specialCase(block, next, nextNext);
			if (folded !== null) {
				const h = !nextNext
					? Math.max(10, Math.round(block.baseDepthInMetres * 10) - w[0])
					: Math.round(nextNext.topDepthInMetres * 10) - w[0];
				const n = Math.min(h, pageIndex * 90 - w[0]);
				const start = w[0];
				const advanced = advanceScaleTicks(n, w);
				rows.push({ label: `${block.id}+${folded.id}`, startTick: start, tickCount: advanced });
				blockIndex += 2;
				continue;
			}

			const h =
				block.blockTypeId === END_OF_BOREHOLE_BLOCK_TYPE_ID
					? Math.max(8 + (block.remarks.length === 0 ? 0 : 10 + block.remarks.length / 30), pageIndex * 90 - w[0])
					: !next
						? Math.max(10, Math.round(block.baseDepthInMetres * 10) - w[0])
						: Math.round(next.topDepthInMetres * 10) - w[0];
			const n = Math.min(h, pageIndex * 90 - w[0]);

			if (n < h / 2) {
				renderEmpty(n, w, rows);
				continue; // NB: blockIndex deliberately not advanced, as in the original
			}

			const start = w[0];
			const advanced = advanceScaleTicks(n, w);
			rows.push({ label: block.id, startTick: start, tickCount: advanced });
			++blockIndex;
		}
		if (blockIndex === blocks.length) {
			renderEmpty(pageIndex * 90 - w[0], w, rows);
		}
		// --- end renderBlocksToHtml() ---

		w[0] = pageIndex * 90;
		++pageIndex;
	}

	return { rows, pages: pageIndex - 1, ranAway };
}
