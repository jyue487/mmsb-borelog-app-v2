
import { CELL_PADDING_PT, CELL_TEXT_TOP_INSET_PT, DESCRIPTION_COLUMN } from '../layout/constants';
import { BASE_FONT_SIZE_PT, HAIRLINE_PT, type PageGeometry } from '../layout/pageGeometry';
import type { DrawNode, ReportWarning, TextLine } from '../model/doc';
import type { BodyRow, PrefitDescription, RowCell, VAlign } from '../model/table';
import { fitTextToBox } from '../text/fitTextToBox';
import type { TextMeasurer } from '../text/measure';
import { hRule, line, run, stack, textNode, vRule } from './drawText';

/**
 * Turns semantic rows into coordinates, and strokes the grid around them.
 *
 * The grid stroker is the part with a real constraint: **the set of interior vertical rules
 * is per-row, not global.** Most rows split columns 5-10 into six SPT cells, but coring,
 * cavity and Lugeon rows merge them into three double-width cells — so a stroker that drew
 * one full-height rule per column boundary would paint lines through the middle of every
 * CORE RUN / T.C.R. / R.Q.D. cell.
 */

/**
 * The DESCRIPTION column is the one cell holding prose rather than a value, so it gets a
 * text margin instead of a hairline's clearance, and is set a little tighter than the
 * one-line cells beside it — the lines belong to each other, the cells do not.
 */
export const DESCRIPTION_PADDING_X_PT = 4;
export const DESCRIPTION_LINE_HEIGHT_FACTOR = 1.1;

/**
 * The usable box inside the DESCRIPTION cell of a row `tickCount` ticks tall.
 *
 * Exported because a block split across a page break has to be fitted once against all of
 * its parts' boxes at once, which happens in `fitDescriptions.ts` — before any row reaches
 * the code below. Both callers must agree on the insets or the pre-fitted lines would be
 * measured against one box and drawn into another.
 */
export function descriptionBoxPt(
	tickCount: number,
	geometry: PageGeometry,
): { widthPt: number; heightPt: number } {
	return {
		widthPt: geometry.columnWidth(DESCRIPTION_COLUMN) - DESCRIPTION_PADDING_X_PT * 2,
		heightPt: tickCount * geometry.tickPitchPt - CELL_TEXT_TOP_INSET_PT - CELL_PADDING_PT,
	};
}

/** Mirrors the backend's vertical alignment, for content the builder places itself. */
function valignOffsetPt(valign: VAlign, boxHeight: number, contentHeight: number): number {
	if (valign === 'middle') return Math.max(0, (boxHeight - contentHeight) / 2);
	if (valign === 'bottom') return Math.max(0, boxHeight - contentHeight);
	return 0;
}

export function buildBodyNodes(
	rows: BodyRow[],
	geometry: PageGeometry,
	pageStartTick: number,
	measurer: TextMeasurer,
	pageNumber: number,
	warnings: ReportWarning[],
): DrawNode[] {
	const nodes: DrawNode[] = [];

	// Outer body box and the two vertical edges.
	nodes.push({
		kind: 'rect',
		x: geometry.contentX,
		y: geometry.bodyY,
		w: geometry.contentWidthPt,
		h: geometry.bodyHeightPt,
		thicknessPt: HAIRLINE_PT,
	});

	for (const row of rows) {
		const rowY = geometry.bodyY + (row.startTick - pageStartTick) * geometry.tickPitchPt;
		const rowH = row.tickCount * geometry.tickPitchPt;
		if (rowH <= 0) {
			continue;
		}

		// Horizontal rule at the row's bottom edge. The final row's edge is the body box's
		// own border, so it is skipped to avoid double-stroking (which prints visibly darker).
		const bottom = rowY + rowH;
		if (bottom < geometry.bodyY + geometry.bodyHeightPt - 0.01) {
			nodes.push(hRule(geometry.contentX, bottom, geometry.contentWidthPt, HAIRLINE_PT));
		}

		// Interior vertical rules, taken from THIS row's cell boundaries.
		for (const cell of row.cells) {
			if (cell.column === 0) {
				continue;
			}
			nodes.push(vRule(geometry.columnX(cell.column), rowY, rowH, HAIRLINE_PT));
		}

		for (const cell of row.cells) {
			nodes.push(...buildCellNodes(cell, rowY, rowH, geometry, measurer, pageNumber, row.startTick, warnings));
		}
	}

	return nodes;
}

function buildCellNodes(
	cell: RowCell,
	rowY: number,
	rowH: number,
	geometry: PageGeometry,
	measurer: TextMeasurer,
	pageNumber: number,
	startTick: number,
	warnings: ReportWarning[],
): DrawNode[] {
	const paddingX = cell.content.kind === 'rich' ? DESCRIPTION_PADDING_X_PT : CELL_PADDING_PT;
	const x = geometry.columnX(cell.column) + paddingX;
	const w = geometry.columnWidth(cell.column, cell.colSpan) - paddingX * 2;
	const y = rowY + CELL_TEXT_TOP_INSET_PT;
	const h = rowH - CELL_TEXT_TOP_INSET_PT - CELL_PADDING_PT;
	const sizePt = cell.fontSizePt ?? BASE_FONT_SIZE_PT;

	if (w <= 0 || h <= 0) {
		return [];
	}

	switch (cell.content.kind) {
		case 'empty':
			return [];

		case 'lines': {
			const lines = stack(cell.content.lines, sizePt);
			return [textNode(lines, x, y, w, h, sizePt * 1.15, cell.align, cell.valign)];
		}

		case 'rich': {
			// The DESCRIPTION cell — the one place text is fitted rather than placed. A block
			// split across a page break arrives already fitted, because its size had to be
			// agreed with the parts on the other pages; the warning was raised there too, once
			// for the block rather than once per part.
			let fit: PrefitDescription;
			if (cell.content.prefit !== undefined) {
				fit = cell.content.prefit;
			} else {
				const own = fitTextToBox(cell.content.tokens, w, h, measurer, DESCRIPTION_LINE_HEIGHT_FACTOR);
				if (own.overflowed) {
					warnings.push({ kind: 'descriptionClipped', pageNumber, startTick });
				}
				fit = own;
			}
			const lines: TextLine[] = fit.lines.map((laidOut) => ({
				runs: laidOut.runs.map((r) => run(r.text, fit.sizePt, r.fontId)),
			}));
			return [textNode(lines, x, y, w, h, fit.lineHeightPt, cell.align, cell.valign)];
		}

		case 'divided': {
			// Blow count over a rule over the penetration depth — a two-line stack, aligned in
			// the cell exactly like any other, so the blow count starts level with the depths and
			// the description beside it. The rule sits at the midpoint between the upper
			// baseline and the lower line's cap-top, which keeps it attached to the numbers
			// however tall the row is.
			const leadingPt = sizePt * 1.15;
			const capHeightPt = measurer.capHeightOf('regular', sizePt);
			const divided = cell.content.bottom !== '';
			const pairTop = y + valignOffsetPt(cell.valign, h, divided ? leadingPt + capHeightPt : capHeightPt);
			const nodes: DrawNode[] = [
				textNode([line(run(cell.content.top, sizePt))], x, pairTop, w, leadingPt, leadingPt, 'center', 'top'),
			];
			// Nothing below, nothing to divide: an incomplete increment is one number, not an
			// underlined one.
			if (divided) {
				nodes.push(hRule(x, pairTop + (leadingPt + capHeightPt) / 2, w, HAIRLINE_PT * 0.7));
				nodes.push(
					textNode([line(run(cell.content.bottom, sizePt))], x, pairTop + leadingPt, w, leadingPt, leadingPt, 'center', 'top'),
				);
			}
			return nodes;
		}

		case 'pinned': {
			// Start-of-day pinned to the top, end-of-day to the bottom — `position: absolute`
			// inset-0 in the old markup, trivial once everything is absolute anyway.
			const nodes: DrawNode[] = [];
			if (cell.content.top.length > 0) {
				nodes.push(textNode(stack(cell.content.top, sizePt), x, y, w, h / 2, sizePt * 1.15, cell.align, 'top'));
			}
			if (cell.content.bottom.length > 0) {
				nodes.push(textNode(stack(cell.content.bottom, sizePt), x, y + h / 2, w, h / 2, sizePt * 1.15, cell.align, 'bottom'));
			}
			return nodes;
		}
	}
}
