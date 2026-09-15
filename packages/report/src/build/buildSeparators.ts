import { COLUMN_COUNT } from '../layout/constants';
import { isSamePos, type BodyPos, type Separator } from '../layout/flowContent';
import { BASE_FONT_SIZE_PT, DAY_WORK_STATUS_FONT_SIZE_PT, HAIRLINE_PT, type PageGeometry } from '../layout/pageGeometry';
import type { DrawNode } from '../model/doc';
import type { TextMeasurer } from '../text/measure';
import { hRule } from './drawText';

/**
 * The horizontal rules between rows — and the shape they take when a row has been pushed.
 *
 * A row that starts where its depth interval starts gets one straight rule. A row whose
 * contents were pushed down by the row above it (`flowContent.ts`) gets three segments:
 *
 *     (x0, y1) ──╮                                  ╭── (x3, y1)     y1: the depth top, on
 *                 ╲                                ╱                       the ruler
 *          (x1, y2) ───────────────────────── (x2, y2)               y2: where the contents
 *                                                                          actually start
 *
 * The outer ends stay on the depth line, so the ruler is still read correctly; the inner
 * span drops to the content line, so nothing is drawn over; and the two diagonals, one inside
 * DATE & TIME and one inside R/r, are what tell a reader the row above was extended. `x1` and
 * `x2` sit strictly inside those columns — at the edges of the widest values the columns
 * ever hold, so the diagonals never cross text — and `x3` is the SCALE column's left edge,
 * where every row rule stops: a rule run through the ruler would land among its 0.1 m ticks
 * and read as one more of them.
 *
 * Both positions are `{ page, yPt }`, and a pushed row's `y2` can be on the page after its
 * `y1`. The diagonals are then clipped at the fold — the top of each on one page, the rest
 * on the next — which is the same "as much as fits here, the rest continues" a split block
 * gets, applied to a line.
 */

export interface SeparatorInsets {
	x0: number;
	x1: number;
	x2: number;
	x3: number;
}

const EPS = 1e-6;

export function separatorInsets(geometry: PageGeometry, measurer: TextMeasurer): SeparatorInsets {
	const x0 = geometry.contentX;
	const x3 = geometry.columnX(COLUMN_COUNT - 1);

	// DATE & TIME centres a `YYYY/MM/DD`; NotoSans' digits are tabular, so every date is this
	// wide. R/r centres a recovery percentage, of which `100.0` is the widest.
	const dateWidthPt = measurer.widthOf('0000/00/00', 'regular', DAY_WORK_STATUS_FONT_SIZE_PT);
	const x1 = geometry.columnX(0) + (geometry.columnWidth(0) - dateWidthPt) / 2;
	const recoveryWidthPt = measurer.widthOf('100.0', 'regular', BASE_FONT_SIZE_PT);
	const recoveryColumn = COLUMN_COUNT - 2;
	const x2 = geometry.columnX(recoveryColumn) + (geometry.columnWidth(recoveryColumn) + recoveryWidthPt) / 2;

	if (!(x0 < x1 && x1 < x2 && x2 < x3)) {
		throw new Error(`separator insets out of order: ${[x0, x1, x2, x3].join(', ')}`);
	}
	return { x0, x1, x2, x3 };
}

/** One diagonal, clipped to the band `[lo, hi]` of continuous body points. */
function clipDiagonal(
	xa: number,
	ya: number,
	xb: number,
	yb: number,
	lo: number,
	hi: number,
): { x1: number; y1: number; x2: number; y2: number } | null {
	const t0 = Math.max(0, (lo - ya) / (yb - ya));
	const t1 = Math.min(1, (hi - ya) / (yb - ya));
	if (t1 - t0 <= EPS) {
		return null;
	}
	return {
		x1: xa + (xb - xa) * t0,
		y1: ya + (yb - ya) * t0,
		x2: xa + (xb - xa) * t1,
		y2: ya + (yb - ya) * t1,
	};
}

/** The rules that fall on one page. `page` is 0-based, as `BodyPos.page` is. */
export function buildSeparatorNodes(
	separators: Separator[],
	page: number,
	geometry: PageGeometry,
	insets: SeparatorInsets,
): DrawNode[] {
	const nodes: DrawNode[] = [];
	const { x0, x1, x2, x3 } = insets;
	const H = geometry.bodyHeightPt;
	const localY = (pos: BodyPos) => geometry.bodyY + pos.yPt;
	// A position at `yPt: 0` is the page's top border, which the body box already strokes;
	// drawing it again prints visibly darker.
	const onThisPage = (pos: BodyPos) => pos.page === page && pos.yPt > EPS;

	for (const separator of separators) {
		const { y1, y2 } = separator;

		if (isSamePos(y1, y2)) {
			if (onThisPage(y1)) {
				nodes.push(hRule(x0, localY(y1), x3 - x0, HAIRLINE_PT));
			}
			continue;
		}

		if (onThisPage(y2)) {
			nodes.push(hRule(x1, localY(y2), x2 - x1, HAIRLINE_PT));
		}

		// The diagonals run from the depth line to the content line, possibly across pages;
		// each is drawn in continuous points and clipped to this page's band.
		const a1 = y1.page * H + y1.yPt;
		const a2 = y2.page * H + y2.yPt;
		for (const [xa, xb] of [
			[x0, x1],
			[x3, x2],
		]) {
			const piece = clipDiagonal(xa, a1, xb, a2, page * H, (page + 1) * H);
			if (piece !== null) {
				nodes.push({
					kind: 'line',
					x1: piece.x1,
					y1: geometry.bodyY + piece.y1 - page * H,
					x2: piece.x2,
					y2: geometry.bodyY + piece.y2 - page * H,
					thicknessPt: HAIRLINE_PT,
				});
			}
		}
	}

	return nodes;
}
