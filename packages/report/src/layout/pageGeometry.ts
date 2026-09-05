import { DEFAULT_LINE_HEIGHT_FACTOR } from '../text/measure';
import {
	A4_HEIGHT_PT,
	A4_WIDTH_PT,
	CELL_PADDING_PT,
	CELL_TEXT_TOP_INSET_PT,
	COLUMN_FRACTIONS,
	CONTENT_WIDTH_PT,
	PAGE_MARGIN_BOTTOM_PT,
	PAGE_MARGIN_LEFT_PT,
	PAGE_MARGIN_TOP_PT,
	TICKS_PER_PAGE,
} from './constants';

/**
 * The vertical band budget for one A4 page.
 *
 * This is the part HTML was doing for free: the browser grew each band to fit its content,
 * so no one ever had to state how tall the header was. Drawing at absolute coordinates
 * means the bands become explicit numbers — and it also means the ruler pitch can finally
 * be DERIVED from the body height instead of being an independent `7px` constant that had
 * nothing tying it to the `297mm` page box.
 *
 * These heights cannot be measured off the supplied reference PDF: that file is US Letter
 * (612x792) with an A4-sized content box overflowing it, so its band positions encode the
 * bug rather than the intent. They are sized here for real A4 and confirmed visually.
 */

/** Logo, company name, sheet number, and the two five-row metadata columns. */
export const HEADER_HEIGHT_PT = 112;

/** The static four-row column header (DATE&TIME … SCALE). */
export const COLUMN_HEADER_HEIGHT_PT = 46;

/** Notes/legend tables, the driller block, and the signature block. */
export const FOOTER_HEIGHT_PT = 100;

/**
 * The band the rows live in, and the pitch of one 0.1 m tick within it.
 *
 * Module scope rather than inside `createPageGeometry()` because every input is already a
 * constant, and `paginate()` needs the pitch to answer a question about type size without
 * being handed a geometry or a font. `createPageGeometry()` returns the same numbers.
 */
const BODY_Y_PT = PAGE_MARGIN_TOP_PT + HEADER_HEIGHT_PT + COLUMN_HEADER_HEIGHT_PT;
const FOOTER_Y_PT = A4_HEIGHT_PT - PAGE_MARGIN_BOTTOM_PT - FOOTER_HEIGHT_PT;
export const BODY_HEIGHT_PT = FOOTER_Y_PT - BODY_Y_PT;

/** Height of one 0.1 m tick. Derived, never hardcoded. */
export const TICK_PITCH_PT = BODY_HEIGHT_PT / TICKS_PER_PAGE;

export interface PageGeometry {
	pageWidthPt: number;
	pageHeightPt: number;
	contentX: number;
	contentWidthPt: number;
	headerY: number;
	columnHeaderY: number;
	bodyY: number;
	bodyHeightPt: number;
	footerY: number;
	/** Height of one 0.1 m tick. Derived, never hardcoded. */
	tickPitchPt: number;
	/** Left edge of column `index`, measured from the page's left edge. */
	columnX: (index: number) => number;
	/** Width of `colSpan` columns starting at `index`. */
	columnWidth: (index: number, colSpan?: number) => number;
}

export function createPageGeometry(): PageGeometry {
	const headerY = PAGE_MARGIN_TOP_PT;
	const columnHeaderY = headerY + HEADER_HEIGHT_PT;
	const bodyY = BODY_Y_PT;
	const footerY = FOOTER_Y_PT;
	const bodyHeightPt = BODY_HEIGHT_PT;

	if (bodyHeightPt <= 0) {
		throw new Error('page bands do not fit on A4: header + column header + footer exceed the page');
	}

	// Prefix sums so column edges are exact and never accumulate rounding drift.
	const edges: number[] = [PAGE_MARGIN_LEFT_PT];
	for (const fraction of COLUMN_FRACTIONS) {
		edges.push(edges[edges.length - 1] + fraction * CONTENT_WIDTH_PT);
	}

	return {
		pageWidthPt: A4_WIDTH_PT,
		pageHeightPt: A4_HEIGHT_PT,
		contentX: PAGE_MARGIN_LEFT_PT,
		contentWidthPt: CONTENT_WIDTH_PT,
		headerY,
		columnHeaderY,
		bodyY,
		bodyHeightPt,
		footerY,
		tickPitchPt: TICK_PITCH_PT,
		columnX: (index) => edges[index],
		columnWidth: (index, colSpan = 1) => edges[index + colSpan] - edges[index],
	};
}

/** Base body type size. The old stylesheets disagreed: 7pt on Android, 8pt on iOS. */
export const BASE_FONT_SIZE_PT = 6.5;
export const HAIRLINE_PT = 0.5;

/**
 * The shortest part of a block that is still worth drawing, in ticks.
 *
 * A block whose depth interval straddles a page break is split, and the part on the far side
 * carries only the continued description — its sample label, blow counts and N stay on the
 * first part, because repeating them reads as a second sample at a second depth. That makes
 * the first part the *only* place those values are ever printed, so it has to be tall enough
 * to hold a line of them: less than this and they would appear nowhere at all, and the whole
 * block belongs on the next page instead.
 *
 * Derived rather than chosen. One line costs the top inset, one leading, and the bottom
 * padding; at both 7pt and 6.5pt that is a shade over two ticks, so the answer is three
 * (0.3 m) and the type-size change does not move it.
 */
export const MIN_PART_TICKS = Math.ceil(
	(CELL_TEXT_TOP_INSET_PT + BASE_FONT_SIZE_PT * DEFAULT_LINE_HEIGHT_FACTOR + CELL_PADDING_PT) /
		TICK_PITCH_PT,
);
