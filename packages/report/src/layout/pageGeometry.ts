import {
	A4_HEIGHT_PT,
	A4_WIDTH_PT,
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
	const bodyY = columnHeaderY + COLUMN_HEADER_HEIGHT_PT;
	const footerY = A4_HEIGHT_PT - PAGE_MARGIN_BOTTOM_PT - FOOTER_HEIGHT_PT;
	const bodyHeightPt = footerY - bodyY;

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
		tickPitchPt: bodyHeightPt / TICKS_PER_PAGE,
		columnX: (index) => edges[index],
		columnWidth: (index, colSpan = 1) => edges[index + colSpan] - edges[index],
	};
}

/** Base body type size. The old stylesheets disagreed: 7pt on Android, 8pt on iOS. */
export const BASE_FONT_SIZE_PT = 7;
export const HAIRLINE_PT = 0.5;
