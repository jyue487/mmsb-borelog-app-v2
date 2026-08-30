
import { BASE_FONT_SIZE_PT, HAIRLINE_PT, type PageGeometry } from '../layout/pageGeometry';
import type { DrawNode, ReportWarning, TextLine } from '../model/doc';
import type { BodyRow, RowCell } from '../model/table';
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

const CELL_PADDING_PT = 1.5;

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
	const x = geometry.columnX(cell.column) + CELL_PADDING_PT;
	const w = geometry.columnWidth(cell.column, cell.colSpan) - CELL_PADDING_PT * 2;
	const y = rowY + CELL_PADDING_PT;
	const h = rowH - CELL_PADDING_PT * 2;
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
			// The DESCRIPTION cell — the one place text is fitted rather than placed.
			const fit = fitTextToBox(cell.content.tokens, w, h, measurer);
			if (fit.overflowed) {
				warnings.push({ kind: 'descriptionClipped', pageNumber, startTick });
			}
			const lines: TextLine[] = fit.lines.map((laidOut) => ({
				runs: laidOut.runs.map((r) => run(r.text, fit.sizePt, r.fontId)),
			}));
			return [textNode(lines, x, y, w, h, fit.lineHeightPt, cell.align, cell.valign)];
		}

		case 'divided': {
			// Blow count over a rule over the penetration depth. The rule sits at the vertical
			// midpoint of the pair, not of the cell, so it stays attached to the numbers however
			// tall the row is.
			const nodes: DrawNode[] = [];
			const pairHeight = sizePt * 1.15 * 2;
			const pairTop = y + Math.max(0, (h - pairHeight) / 2);
			nodes.push(textNode([line(run(cell.content.top, sizePt))], x, pairTop, w, pairHeight / 2, sizePt * 1.15, 'center', 'middle'));
			if (cell.content.hasRule) {
				nodes.push(hRule(x, pairTop + pairHeight / 2, w, HAIRLINE_PT * 0.7));
			}
			if (cell.content.bottom !== '') {
				nodes.push(
					textNode([line(run(cell.content.bottom, sizePt))], x, pairTop + pairHeight / 2, w, pairHeight / 2, sizePt * 1.15, 'center', 'middle'),
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
