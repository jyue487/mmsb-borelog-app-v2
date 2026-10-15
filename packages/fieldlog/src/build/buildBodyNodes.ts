import { CELL_PADDING_PT, CELL_TEXT_TOP_INSET_PT, DESCRIPTION_PADDING_X_PT } from '../layout/constants';
import { BASE_FONT_SIZE_PT, HAIRLINE_PT, type PageGeometry } from '../layout/pageGeometry';
import type { DrawNode, TextLine } from '../model/doc';
import type { BodyRow, RowCell, VAlign } from '../model/table';
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
 *
 * The horizontal rules between rows are not drawn here. A row's top edge is not always a
 * straight line — a row pushed down by the one above it is entered through a three-segment
 * separator that can even straddle a page break — so they come from `buildSeparators.ts`,
 * which sees the boundaries rather than the rows.
 */

/** Mirrors the backend's vertical alignment, for content the builder places itself. */
function valignOffsetPt(valign: VAlign, boxHeight: number, contentHeight: number): number {
	if (valign === 'middle') return Math.max(0, (boxHeight - contentHeight) / 2);
	if (valign === 'bottom') return Math.max(0, boxHeight - contentHeight);
	return 0;
}

export function buildBodyNodes(rows: BodyRow[], geometry: PageGeometry, measurer: TextMeasurer): DrawNode[] {
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
		const rowY = geometry.bodyY + row.topPt;
		const rowH = row.heightPt;
		if (rowH <= 0) {
			continue;
		}

		// Interior vertical rules, taken from THIS row's cell boundaries.
		for (const cell of row.cells) {
			if (cell.column === 0) {
				continue;
			}
			nodes.push(vRule(geometry.columnX(cell.column), rowY, rowH, HAIRLINE_PT));
		}

		for (const cell of row.cells) {
			nodes.push(...buildCellNodes(cell, rowY, rowH, geometry, measurer));
		}
	}

	return nodes;
}

function buildCellNodes(cell: RowCell, rowY: number, rowH: number, geometry: PageGeometry, measurer: TextMeasurer): DrawNode[] {
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
			// The DESCRIPTION cell. The lines arrive wrapped, and the row was made tall enough
			// for them (`rowMetrics.ts`, `flowContent.ts`), so they are placed as given.
			const { sizePt: descriptionSizePt, lineHeightPt } = cell.content;
			const lines: TextLine[] = cell.content.lines.map((laidOut) => ({
				runs: laidOut.runs.map((r) => run(r.text, descriptionSizePt, r.fontId)),
			}));
			return [textNode(lines, x, y, w, h, lineHeightPt, cell.align, cell.valign)];
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
