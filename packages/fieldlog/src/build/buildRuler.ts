import { COLUMN_COUNT, TICKS_PER_PAGE } from '../layout/constants';
import { HAIRLINE_PT, type PageGeometry } from '../layout/pageGeometry';
import type { DrawNode } from '../model/doc';
import { line, run, textNode } from './drawText';

/**
 * The depth scale: 90 ticks per page, one every 0.1 m, labelled every metre.
 *
 * Drawn ONCE PER PAGE from the page's starting tick, not accumulated row by row. The old
 * renderer emitted a stack of fixed-height `<div>`s inside every row's scale cell and
 * advanced a shared counter as a side effect of rendering — which is why a block could not
 * be measured without being drawn, and why an overflowing description silently pushed the
 * ruler out of step with the rows below it.
 *
 * Here the tick positions come from the page geometry alone, so the ruler cannot drift from
 * the depths no matter what happens in the other thirteen columns.
 */

const LABEL_SIZE_PT = 4.5;
const MINOR_TICK_PT = 5;
const LABEL_GAP_PT = 1.5;

export function buildRuler(geometry: PageGeometry, startTick: number): DrawNode[] {
	const nodes: DrawNode[] = [];
	const column = COLUMN_COUNT - 1;
	const x = geometry.columnX(column);
	const width = geometry.columnWidth(column);

	for (let i = 0; i <= TICKS_PER_PAGE; i++) {
		const absoluteTick = startTick + i;
		const y = geometry.bodyY + i * geometry.tickPitchPt;
		const isMetre = absoluteTick % 10 === 0;

		// Metre marks run the full column width; the 0.1 m marks are short, as before.
		nodes.push({
			kind: 'line',
			x1: x,
			y1: y,
			x2: isMetre ? x + 2.5 * MINOR_TICK_PT : x + MINOR_TICK_PT,
			y2: y,
			thicknessPt: isMetre ? HAIRLINE_PT : HAIRLINE_PT * 0.7,
		});

		// The last tick of a page is the first tick of the next, so its label would collide
		// with the page boundary rule; the next page draws it.
		if (isMetre && 0 < i && i < TICKS_PER_PAGE) {
			nodes.push(
				textNode(
					[line(run(String(absoluteTick / 10), LABEL_SIZE_PT))],
					x,
					y - 4 * LABEL_GAP_PT,
					width - MINOR_TICK_PT - LABEL_GAP_PT,
					geometry.tickPitchPt,
					LABEL_SIZE_PT * 1.15,
					'right',
					'top',
				),
			);
		}
	}

	return nodes;
}
