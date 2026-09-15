import type { LaidOutLine } from '../text/lineBreak';

/**
 * What a body row contains, before any geometry is applied.
 *
 * This is the semantic tier: it says "this cell holds a blow count over a penetration
 * depth", not "draw this at x=412.7". The geometric tier (DrawNode) comes later, so the
 * row content can be snapshot-tested without a font, a page size, or a PDF.
 */

export type HAlign = 'left' | 'center' | 'right';
export type VAlign = 'top' | 'middle' | 'bottom';

export type CellContent =
	| { kind: 'empty' }
	/** Stacked plain lines, e.g. `P3` over `FHPT1`, or a top/base depth pair. */
	| { kind: 'lines'; lines: string[] }
	/**
	 * The DESCRIPTION cell: styled runs, already wrapped to the column.
	 *
	 * Wrapped before the row exists rather than in the cell, because the row's height is
	 * derived from the line count (`flowContent.ts`) and a block split across a page break
	 * carries only its share of the lines on each part. Nothing is fitted or shrunk: the row
	 * grows to hold whatever is here.
	 */
	| { kind: 'rich'; lines: LaidOutLine[]; sizePt: number; lineHeightPt: number }
	/**
	 * A value over a horizontal rule over a second value — the SPT blow-count columns,
	 * where the lower half only appears once the increment is complete (25 seating blows,
	 * 50 main blows). The rule is what divides the two, so there is one if and only if
	 * `bottom` is non-empty; the old markup drew it unconditionally, which underlined a
	 * blow count for no reason on every incomplete increment.
	 */
	| { kind: 'divided'; top: string; bottom: string }
	/**
	 * Start-of-day text pinned to the top of the cell and end-of-day text pinned to the
	 * bottom, however tall the row is. The old renderer did this with `position: absolute`
	 * inset-0 inside a `position: relative` cell.
	 */
	| { kind: 'pinned'; top: string[]; bottom: string[] };

export interface RowCell {
	/** 0-13; see COLUMN_FRACTIONS. */
	column: number;
	colSpan: number;
	content: CellContent;
	align: HAlign;
	valign: VAlign;
	/** Overrides the band default; used for the shrunken day-work timestamps. */
	fontSizePt?: number;
}

export interface BodyRow {
	/** Offset from the top of the body band, in points; see `flowContent.ts`. */
	topPt: number;
	heightPt: number;
	cells: RowCell[];
	/**
	 * False: columns 5-10 are six single cells (the SPT layout).
	 * True: they are three double-width cells (CORE RUN / T.C.R. / R.Q.D.).
	 *
	 * This is per-row, not per-table, which is why the grid stroker cannot draw one
	 * full-height vertical rule per column boundary.
	 */
	mergedSptColumns: boolean;
}

export function emptyCell(column: number, colSpan = 1): RowCell {
	return { column, colSpan, content: { kind: 'empty' }, align: 'center', valign: 'middle' };
}
