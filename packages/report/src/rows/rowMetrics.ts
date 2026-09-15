import type { Block } from '@mmsb/core';

import { DESCRIPTION_COLUMN, DESCRIPTION_LINE_HEIGHT_FACTOR, DESCRIPTION_PADDING_X_PT } from '../layout/constants';
import type { RowContentMetrics } from '../layout/flowContent';
import { BASE_FONT_SIZE_PT, type PageGeometry } from '../layout/pageGeometry';
import { breakIntoLines } from '../text/lineBreak';
import { DEFAULT_LINE_HEIGHT_FACTOR, type TextMeasurer } from '../text/measure';
import { descriptionTokens } from './blockRowSpec';
import { buildValueCells } from './buildBodyRow';

/**
 * How much vertical room a block's cells need, so `flowContent()` can make the row that tall.
 *
 * Read off the same cells `buildBodyRow` draws, with the same arithmetic `buildCellNodes`
 * places them by: a stack of lines is `n` leadings; a blow count over its penetration is a
 * leading plus a cap height (the rule between them sits inside the leading); the DATE & TIME
 * pins are two stacks that must not meet. The description is wrapped here, once, at base
 * size — the flow deals the lines out and the cell draws them as given.
 */

/** The usable width of the DESCRIPTION cell; the wrap and the draw must agree on it. */
export function descriptionWidthPt(geometry: PageGeometry): number {
	return geometry.columnWidth(DESCRIPTION_COLUMN) - DESCRIPTION_PADDING_X_PT * 2;
}

export function measureRowContent(
	block: Block,
	testBlock: Block | null,
	geometry: PageGeometry,
	measurer: TextMeasurer,
): RowContentMetrics {
	let headPt = 0;
	let pinnedTopPt = 0;
	let pinnedBottomPt = 0;

	for (const cell of buildValueCells(block, testBlock, 0, true)) {
		const sizePt = cell.fontSizePt ?? BASE_FONT_SIZE_PT;
		const leadingPt = sizePt * DEFAULT_LINE_HEIGHT_FACTOR;
		const { content } = cell;
		switch (content.kind) {
			case 'empty':
				break;
			case 'lines':
				headPt = Math.max(headPt, content.lines.filter((text) => text !== '').length * leadingPt);
				break;
			case 'divided': {
				const capHeightPt = measurer.capHeightOf('regular', sizePt);
				headPt = Math.max(headPt, content.bottom === '' ? capHeightPt : leadingPt + capHeightPt);
				break;
			}
			case 'pinned':
				pinnedTopPt = content.top.length * leadingPt;
				pinnedBottomPt = content.bottom.length * leadingPt;
				break;
			case 'rich':
				throw new Error('the description is not a value cell');
		}
	}

	const lines = breakIntoLines(descriptionTokens(block, testBlock), descriptionWidthPt(geometry), BASE_FONT_SIZE_PT, measurer);

	return {
		headPt,
		pinnedTopPt,
		pinnedBottomPt,
		lines,
		lineHeightPt: BASE_FONT_SIZE_PT * DESCRIPTION_LINE_HEIGHT_FACTOR,
	};
}
