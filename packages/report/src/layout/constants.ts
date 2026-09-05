/**
 * The report's fixed geometry, in one place.
 *
 * Everything here is either a domain convention (the depth scale) or A4 paper. The old
 * renderer scattered these across CSS custom properties, inline `px` in the ruler, and
 * percentage column widths whose residual was computed by the browser — which is how the
 * ruler and the page box came to be measured in different units and drifted apart.
 */

/** 1 tick = 0.1 m. A domain convention, not a layout choice. */
export const METRES_PER_TICK = 0.1;

/** 90 ticks = 9 m = one page. The report's defining convention. */
export const TICKS_PER_PAGE = 90;

/** A4 portrait in PostScript points (1pt = 1/72"). */
export const A4_WIDTH_PT = 595.276;
export const A4_HEIGHT_PT = 841.89;

/** 1mm in points. */
export const MM = 72 / 25.4;

/**
 * Symmetric page margins. The old Android stylesheet used `padding-right: 0mm`, which ran
 * the table flush to the paper edge, and iOS used 15mm/5mm but only inside `@media print`.
 * Neither was deliberate.
 */
export const PAGE_MARGIN_TOP_PT = 10 * MM;
export const PAGE_MARGIN_BOTTOM_PT = 10 * MM;
export const PAGE_MARGIN_LEFT_PT = 20 * MM;
export const PAGE_MARGIN_RIGHT_PT = 10 * MM;

export const CONTENT_WIDTH_PT = A4_WIDTH_PT - PAGE_MARGIN_LEFT_PT - PAGE_MARGIN_RIGHT_PT;

/**
 * Column widths as fractions of the content width.
 *
 * Transcribed from the percentage widths on the static header at
 * `apps/mobile/src/utils/pdf/generatePdfPages.ts:236-243`. The declared values sum to
 * 70.5%; DESCRIPTION carried no width at all and silently took the residual, so 0.295 is
 * that residual made explicit. The six SPT sub-columns split the declared 28% evenly.
 *
 * Index order matches the body rows: every renderer emits these 14 cells left to right.
 */
export const COLUMN_FRACTIONS = [
	0.058, // 0  DATE & TIME
	0.065, // 1  SAMPLING / TESTING / CORING
	0.12, //  2  DEPTH
	0.05, //  3  WL
	0.295, // 4  DESCRIPTION  (was the implicit residual)
	0.28 / 6, // 5  SPT 75mm
	0.28 / 6, // 6
	0.28 / 6, // 7
	0.28 / 6, // 8
	0.28 / 6, // 9
	0.28 / 6, // 10
	0.055, // 11 SPT (N)
	0.042, // 12 R/r
	0.035, // 13 SCALE
] as const;

export const COLUMN_COUNT = COLUMN_FRACTIONS.length;

/** The six SPT sub-columns, which the coring family merges into three double-width cells. */
export const SPT_COLUMN_START = 5;
export const SPT_COLUMN_COUNT = 6;

if (Math.abs(COLUMN_FRACTIONS.reduce((a, b) => a + b, 0) - 1) > 1e-9) {
	throw new Error('COLUMN_FRACTIONS must sum to 1');
}
