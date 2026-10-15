import type { Block, BlockTypeId } from '@mmsb/core';

import type { LaidOutLine } from '../text/lineBreak';
import { CELL_PADDING_PT, CELL_TEXT_TOP_INSET_PT, TICKS_PER_PAGE } from './constants';
import type { PageSlice } from './paginate';

/**
 * Where each row's CONTENTS land, in points — the second of the report's two vertical layers.
 *
 * `paginate()` is the first: it places every block's depth interval in ticks, and that is
 * what the ruler and the separator's outer ends are drawn from, so a block always begins at
 * its true depth on the scale. But a 0.1 m interval is 5.86 pt, and no sample label, blow
 * count or line of description fits in that. Rather than shrink or clip, a row is made **as
 * tall as its contents need**, and everything below it is pushed down until a block whose
 * interval has room to spare absorbs the push. The result is a second position per row — where
 * its contents start, at or below its depth top — and that offset is what the drawing layer
 * renders as the three-segment separator (`buildSeparators.ts`): depth on the outside,
 * contents on the inside, and a diagonal between them that says "this block was extended".
 *
 * Positions are `{ page, yPt }` rather than one running number of points, so a page boundary
 * is exact: a row that ends at the foot of one page starts the next at `yPt: 0`, never at
 * `bodyHeightPt - 1e-13`.
 *
 * Contents are cut at page boundaries the way depth intervals are. The head of a block — its
 * sample label, depths, blow counts, recovery — prints once, on the first part, so the first
 * part must be tall enough to hold it: when the strip left at the foot of a page is not, the
 * contents start at the top of the next page instead, and the strip becomes the previous
 * row's extension. The description's lines are dealt across the parts in order.
 *
 * The flow can run past the last depth page. An end of borehole with long remarks near the
 * foot of the final page continues on a page of its own, which has ticks on the ruler like
 * any other and nothing else.
 */

export interface BodyPos {
	/** 0-based. */
	page: number;
	/** Offset from the top of the body band, `0 <= yPt < bodyHeightPt`. */
	yPt: number;
}

/** What a row's cells need vertically, at their fixed sizes. Everything in points. */
export interface RowContentMetrics {
	/** The tallest once-only cell: sample label, depths, WL, the SPT band, N, R/r. */
	headPt: number;
	/** DATE & TIME's start-of-shift stack, pinned to the top of the first part. */
	pinnedTopPt: number;
	/** DATE & TIME's end-of-shift stack, pinned to the bottom of the last part. */
	pinnedBottomPt: number;
	/** The description, already wrapped to the column at base size. */
	lines: LaidOutLine[];
	lineHeightPt: number;
}

export const EMPTY_METRICS: RowContentMetrics = {
	headPt: 0,
	pinnedTopPt: 0,
	pinnedBottomPt: 0,
	lines: [],
	lineHeightPt: 0,
};

export type ContentPart =
	| {
			kind: 'block';
			block: Block;
			/** An in-situ test folded into this row; see collapsePairs.ts. */
			testBlock: Block | null;
			page: number;
			topPt: number;
			heightPt: number;
			/** 0 for the part carrying the head; later parts carry description only. */
			partIndex: number;
			/** False when the contents continue on the next page. */
			isFinalPart: boolean;
			/** This part's share of the description. */
			lines: LaidOutLine[];
			lineHeightPt: number;
	  }
	| {
			kind: 'empty';
			referenceBlockTypeId: BlockTypeId;
			page: number;
			topPt: number;
			heightPt: number;
	  };

/**
 * The boundary above a row: where its depth interval starts (`y1`, on the ruler) and where
 * its contents start (`y2`). Equal for a row that was not pushed, and then it is drawn as an
 * ordinary horizontal rule.
 */
export interface Separator {
	y1: BodyPos;
	y2: BodyPos;
}

export interface ContentPage {
	/** 1-based, matching the printed "SHEET n of N". */
	pageNumber: number;
	startTick: number;
	parts: ContentPart[];
}

export interface ContentFlow {
	pages: ContentPage[];
	separators: Separator[];
}

export interface FlowGeometry {
	bodyHeightPt: number;
	tickPitchPt: number;
}

const EPS = 1e-6;

/** Top inset plus bottom clearance: what a box of any height spends before its first line. */
const INSETS_PT = CELL_TEXT_TOP_INSET_PT + CELL_PADDING_PT;

function posOfTick(tick: number, tickPitchPt: number): BodyPos {
	return { page: Math.floor(tick / TICKS_PER_PAGE), yPt: (tick % TICKS_PER_PAGE) * tickPitchPt };
}

function advance(pos: BodyPos, byPt: number, bodyHeightPt: number): BodyPos {
	let page = pos.page;
	let yPt = pos.yPt + byPt;
	while (yPt >= bodyHeightPt - EPS) {
		yPt -= bodyHeightPt;
		page += 1;
	}
	return { page, yPt: yPt < EPS ? 0 : yPt };
}

function compare(a: BodyPos, b: BodyPos): number {
	return a.page !== b.page ? a.page - b.page : a.yPt - b.yPt;
}

function later(a: BodyPos, b: BodyPos): BodyPos {
	return compare(a, b) >= 0 ? a : b;
}

/** The foot of the page `pos` is on — or `pos` itself when it already sits on a boundary. */
function endOfPage(pos: BodyPos): BodyPos {
	return pos.yPt === 0 ? pos : { page: pos.page + 1, yPt: 0 };
}

export function isSamePos(a: BodyPos, b: BodyPos): boolean {
	return a.page === b.page && Math.abs(a.yPt - b.yPt) < EPS;
}

/** A block's depth interval, with the parts `paginate()` cut it into merged back together. */
type DepthRow =
	| { kind: 'block'; block: Block; testBlock: Block | null; depthTop: BodyPos; depthBottom: BodyPos }
	| { kind: 'empty'; referenceBlockTypeId: BlockTypeId; depthTop: BodyPos; depthBottom: BodyPos };

function mergeDepthParts(slices: PageSlice[], tickPitchPt: number): DepthRow[] {
	const rows: DepthRow[] = [];
	for (const slice of slices) {
		for (const placed of slice.rows) {
			const depthTop = posOfTick(placed.startTick, tickPitchPt);
			const depthBottom = posOfTick(placed.startTick + placed.tickCount, tickPitchPt);
			if (placed.kind === 'block' && placed.partIndex > 0) {
				const previous = rows[rows.length - 1];
				if (previous === undefined || previous.kind !== 'block' || previous.block.id !== placed.block.id) {
					throw new Error(`part ${placed.partIndex} of ${placed.block.id} does not follow its part ${placed.partIndex - 1}`);
				}
				previous.depthBottom = depthBottom;
				continue;
			}
			rows.push(
				placed.kind === 'block'
					? { kind: 'block', block: placed.block, testBlock: placed.testBlock, depthTop, depthBottom }
					: { kind: 'empty', referenceBlockTypeId: placed.referenceBlockTypeId, depthTop, depthBottom },
			);
		}
	}
	return rows;
}

interface Box {
	page: number;
	y0: number;
	y1: number;
}

/** `[top, bottom)` cut at page boundaries. Zero-height pieces are dropped. */
function cutAtPages(top: BodyPos, bottom: BodyPos, bodyHeightPt: number): Box[] {
	const boxes: Box[] = [];
	for (let page = top.page; page <= bottom.page; page++) {
		const y0 = page === top.page ? top.yPt : 0;
		const y1 = page === bottom.page ? bottom.yPt : bodyHeightPt;
		if (y1 - y0 > EPS) {
			boxes.push({ page, y0, y1 });
		}
	}
	return boxes;
}

/** Whole lines of `lineHeightPt` a box of this height holds once the insets are paid. */
function capacityOf(boxHeightPt: number, lineHeightPt: number): number {
	if (lineHeightPt <= 0) {
		return 0;
	}
	return Math.max(0, Math.floor((boxHeightPt - INSETS_PT) / lineHeightPt + EPS));
}

/**
 * The boxes a row's contents occupy, from `top` down to wherever they end — at least to the
 * bottom of its depth interval, and further when the cells need it.
 *
 * Cutting at a page boundary costs: each piece pays the insets again, and a line does not
 * straddle the fold, so the pieces together can hold fewer lines than one box of the same
 * total height. When that leaves lines over, the bottom moves down by what they need and the
 * cut is redone. The last piece also has to hold the end-of-shift pin when it is not the
 * first (the first is guaranteed by the caller). Each retry adds a full line of height, so
 * the loop ends within a handful of passes; the guard is against a bug, not a fixture.
 */
function placeContents(
	top: BodyPos,
	depthBottom: BodyPos,
	metrics: RowContentMetrics,
	bodyHeightPt: number,
	fillsPage: boolean,
): { boxes: Box[]; linesPerBox: LaidOutLine[][]; bottom: BodyPos } {
	const lineCount = metrics.lines.length;
	const { lineHeightPt } = metrics;
	const requiredPt =
		INSETS_PT + Math.max(metrics.headPt, metrics.pinnedTopPt + metrics.pinnedBottomPt, lineCount * lineHeightPt);

	let bottom = later(advance(top, requiredPt, bodyHeightPt), depthBottom);
	if (fillsPage) {
		bottom = endOfPage(bottom);
	}

	for (let attempt = 0; attempt < 100; attempt++) {
		const boxes = cutAtPages(top, bottom, bodyHeightPt);
		const linesPerBox: LaidOutLine[][] = [];
		let dealt = 0;
		for (const box of boxes) {
			const take = Math.min(capacityOf(box.y1 - box.y0, lineHeightPt), lineCount - dealt);
			linesPerBox.push(metrics.lines.slice(dealt, dealt + take));
			dealt += take;
		}

		let shortfallPt = (lineCount - dealt) * lineHeightPt;
		if (boxes.length > 1) {
			const last = boxes[boxes.length - 1];
			shortfallPt = Math.max(shortfallPt, INSETS_PT + metrics.pinnedBottomPt - (last.y1 - last.y0));
		}
		if (shortfallPt <= EPS) {
			return { boxes, linesPerBox, bottom };
		}

		bottom = advance(bottom, shortfallPt, bodyHeightPt);
		if (fillsPage) {
			bottom = endOfPage(bottom);
		}
	}
	throw new Error('content flow did not converge');
}

function assertPagesTile(pages: ContentPage[], bodyHeightPt: number): void {
	for (const page of pages) {
		let yPt = 0;
		for (const part of page.parts) {
			if (Math.abs(part.topPt - yPt) > 1e-3) {
				throw new Error(`page ${page.pageNumber}: a part starts at ${part.topPt}pt, expected ${yPt}pt`);
			}
			yPt = part.topPt + part.heightPt;
		}
		if (Math.abs(yPt - bodyHeightPt) > 1e-3) {
			throw new Error(`page ${page.pageNumber}: parts end at ${yPt}pt, expected ${bodyHeightPt}pt`);
		}
	}
}

export function flowContent(
	slices: PageSlice[],
	geometry: FlowGeometry,
	metricsOf: (block: Block, testBlock: Block | null) => RowContentMetrics,
): ContentFlow {
	const { bodyHeightPt, tickPitchPt } = geometry;
	const rows = mergeDepthParts(slices, tickPitchPt);
	const parts: ContentPart[] = [];
	const separators: Separator[] = [];

	/** Where the previous row's contents ended; the next row's cannot start above it. */
	let cursor: BodyPos = { page: 0, yPt: 0 };

	rows.forEach((row, index) => {
		const metrics = row.kind === 'block' ? metricsOf(row.block, row.testBlock) : EMPTY_METRICS;
		let top = later(row.depthTop, cursor);

		if (row.kind === 'block') {
			// The first part is the only place the head is printed, so it has to fit there. If
			// what is left of this page cannot hold it, the contents start on the next page —
			// and the strip they leave behind is the previous row's, extended down to the fold,
			// because the grid has to be continuous whether or not there is anything in it.
			const firstPartPt =
				INSETS_PT +
				Math.max(metrics.headPt, metrics.pinnedTopPt, metrics.lines.length > 0 ? metrics.lineHeightPt : 0);
			if (top.yPt + firstPartPt > bodyHeightPt + EPS) {
				const previous = parts[parts.length - 1];
				if (previous === undefined || previous.page !== cursor.page) {
					throw new Error(`no part to extend to the foot of page ${cursor.page + 1}`);
				}
				previous.heightPt = bodyHeightPt - previous.topPt;
				top = { page: top.page + 1, yPt: 0 };
			}
		}

		separators.push({ y1: row.depthTop, y2: top });

		const placed = placeContents(top, row.depthBottom, metrics, bodyHeightPt, index === rows.length - 1);
		placed.boxes.forEach((box, boxIndex) => {
			if (row.kind === 'empty') {
				parts.push({
					kind: 'empty',
					referenceBlockTypeId: row.referenceBlockTypeId,
					page: box.page,
					topPt: box.y0,
					heightPt: box.y1 - box.y0,
				});
				return;
			}
			parts.push({
				kind: 'block',
				block: row.block,
				testBlock: row.testBlock,
				page: box.page,
				topPt: box.y0,
				heightPt: box.y1 - box.y0,
				partIndex: boxIndex,
				isFinalPart: boxIndex === placed.boxes.length - 1,
				lines: placed.linesPerBox[boxIndex],
				lineHeightPt: metrics.lineHeightPt,
			});
		});
		cursor = placed.bottom;
	});

	const lastPart = parts[parts.length - 1];
	const pageCount = Math.max(slices.length, lastPart === undefined ? 0 : lastPart.page + 1);
	const pages: ContentPage[] = Array.from({ length: pageCount }, (_, page) => ({
		pageNumber: page + 1,
		startTick: page * TICKS_PER_PAGE,
		parts: parts.filter((part) => part.page === page),
	}));
	assertPagesTile(pages, bodyHeightPt);

	return { pages, separators };
}

export function isBlockPart(part: ContentPart): part is Extract<ContentPart, { kind: 'block' }> {
	return part.kind === 'block';
}
