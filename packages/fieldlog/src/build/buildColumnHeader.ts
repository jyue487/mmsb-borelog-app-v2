import { COLUMN_COUNT, SPT_COLUMN_START } from '../layout/constants';
import { COLUMN_HEADER_HEIGHT_PT, HAIRLINE_PT, type PageGeometry } from '../layout/pageGeometry';
import type { DrawNode } from '../model/doc';
import { box, hRule, line, run, textNode, vRule } from './drawText';

/**
 * The static four-row column header.
 *
 * In HTML this was rowspan 3/4 and colspan 6 over percentage widths
 * (`generatePdfPages.ts:233-266`). Spans are a way of describing a fixed grid to a layout
 * engine; with no engine the grid is just rectangles, so a "rowspan 4" cell is simply a box
 * that happens to be four rows tall. This is the one place where drawing at coordinates is
 * plainly simpler than the markup it replaces.
 *
 *   row 0 │ DATE&TIME │ SAMPLING │ DEPTH │ WL │ DESCRIPTION │      SPT (6 wide)      │ SPT(N) │ R/r │ SCALE
 *   row 1 │  (span 4) │ (span 4) │(span3)│(3) │   (span 4)  │ 75mm ×6                │ (span4)│ (3) │ (span 3)
 *   row 2 │           │          │       │    │             │ CORE RUN │ T.C.R.│R.Q.D.│        │     │
 *   row 3 │           │          │   m   │ m  │             │  m  │  %  │  %          │   %    │  m  │
 */

const HEADING_SIZE_PT = 6;
const UNIT_SIZE_PT = 5.5;

export function buildColumnHeader(geometry: PageGeometry): DrawNode[] {
	const nodes: DrawNode[] = [];
	const y = geometry.columnHeaderY;
	const height = COLUMN_HEADER_HEIGHT_PT;
	const rowHeight = height / 4;

	const cell = (
		text: string,
		column: number,
		colSpan: number,
		rowStart: number,
		rowSpan: number,
		sizePt = HEADING_SIZE_PT,
	) => {
		const x = geometry.columnX(column);
		const w = geometry.columnWidth(column, colSpan);
		const cellY = y + rowStart * rowHeight;
		const cellH = rowSpan * rowHeight;
		nodes.push(box(x, cellY, w, cellH, HAIRLINE_PT));
		if (text !== '') {
			const lines = text.split('\n').map((part) => line(run(part, sizePt, 'bold')));
			nodes.push(textNode(lines, x, cellY, w, cellH, sizePt * 1.15, 'center', 'middle'));
		}
	};

	nodes.push(box(geometry.contentX, y, geometry.contentWidthPt, height, HAIRLINE_PT));

	// Full-height cells.
	cell('DATE\n&\nTIME', 0, 1, 0, 4);
	cell('SAMPLING\nTESTING\nCORING', 1, 1, 0, 4);
	cell('DESCRIPTION', 4, 1, 0, 4);
	cell('SPT\n(N)', 11, 1, 0, 4);

	// Three rows tall, with a unit row beneath.
	cell('DEPTH', 2, 1, 0, 3);
	cell('m', 2, 1, 3, 1, UNIT_SIZE_PT);
	cell('WL', 3, 1, 0, 3);
	cell('m', 3, 1, 3, 1, UNIT_SIZE_PT);
	cell('R/r', 12, 1, 0, 3);
	cell('%', 12, 1, 3, 1, UNIT_SIZE_PT);

	// The SPT band: one banner, then six 75mm columns, then the coring overlay, then units.
	cell('SPT', SPT_COLUMN_START, 6, 0, 1);
	for (let i = 0; i < 6; i++) {
		cell('75mm', SPT_COLUMN_START + i, 1, 1, 1, UNIT_SIZE_PT);
	}
	cell('CORE RUN', SPT_COLUMN_START, 2, 2, 1, UNIT_SIZE_PT);
	cell('T.C.R.', SPT_COLUMN_START + 2, 2, 2, 1, UNIT_SIZE_PT);
	cell('R.Q.D.', SPT_COLUMN_START + 4, 2, 2, 1, UNIT_SIZE_PT);
	cell('m', SPT_COLUMN_START, 2, 3, 1, UNIT_SIZE_PT);
	cell('%', SPT_COLUMN_START + 2, 2, 3, 1, UNIT_SIZE_PT);
	cell('%', SPT_COLUMN_START + 4, 2, 3, 1, UNIT_SIZE_PT);

	// SCALE, rotated to read bottom-to-top. The old CSS said
	// `writing-mode: vertical-lr; transform: rotate(180deg)`; here it is one flag that the
	// backend turns into pdf-lib's `rotate: degrees(90)`.
	const scaleColumn = COLUMN_COUNT - 1;
	const scaleX = geometry.columnX(scaleColumn);
	const scaleW = geometry.columnWidth(scaleColumn);
	nodes.push(box(scaleX, y, scaleW, height * 0.75, HAIRLINE_PT));
	nodes.push({
		kind: 'text',
		x: scaleX,
		y,
		w: scaleW,
		h: height * 0.75,
		lines: [line(run('SCALE', HEADING_SIZE_PT, 'bold'))],
		leadingPt: HEADING_SIZE_PT * 1.15,
		align: 'center',
		valign: 'middle',
		rotate: 90,
	});
	cell('m', scaleColumn, 1, 3, 1, UNIT_SIZE_PT);

	nodes.push(hRule(geometry.contentX, y + height, geometry.contentWidthPt, HAIRLINE_PT));
	nodes.push(vRule(geometry.contentX, y, height, HAIRLINE_PT));

	return nodes;
}
