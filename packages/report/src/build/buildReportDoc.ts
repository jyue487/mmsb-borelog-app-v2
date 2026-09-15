import { DAY_END_WORK_TYPE, DAY_START_WORK_TYPE, END_OF_BOREHOLE_BLOCK_TYPE_ID, type Block } from '@mmsb/core';

import { flowContent } from '../layout/flowContent';
import { paginate } from '../layout/paginate';
import { BASE_FONT_SIZE_PT, createPageGeometry } from '../layout/pageGeometry';
import type { DrawNode, ReportDoc, ReportPage, ReportWarning } from '../model/doc';
import type { ReportInput } from '../model/input';
import { buildBodyRow } from '../rows/buildBodyRow';
import { measureRowContent } from '../rows/rowMetrics';
import type { TextMeasurer } from '../text/measure';
import { buildBodyNodes } from './buildBodyNodes';
import { buildColumnHeader } from './buildColumnHeader';
import { buildFooter } from './buildFooter';
import { buildHeader } from './buildHeader';
import { buildRuler } from './buildRuler';
import { buildSeparatorNodes, separatorInsets } from './buildSeparators';

/**
 * `ReportInput` → `ReportDoc`. The top of the platform-free half.
 *
 * Note what is absent: the old generator stored each page as a
 * `(pageNumber, totalNumberOfPages) => string` thunk and ran a second pass over them
 * (`generatePdfPages.ts:225-286`), because the page count was not known until the layout
 * loop had finished. Paginating first makes `pages.length` known before any content is
 * built, so the thunks and the second pass both disappear.
 *
 * Two layout passes run before anything is drawn. `paginate()` places depth intervals in
 * ticks, without a font; `flowContent()` then measures what each row's cells need and places
 * the contents in points, pushing rows down where an interval is too short for them — which
 * is the first place that has every page and a measurer at once, and the one that settles
 * the page count, since a pushed end of borehole can need a page the depths did not.
 */

/** First day-start block's start date; `generatePdfPages.ts:28`. */
function findDateStarted(blocks: Block[]): Date | null {
	return blocks.find((block) => block.dayWorkStatus.dayWorkStatusType === DAY_START_WORK_TYPE)?.dayWorkStatus.startDate ?? null;
}

/**
 * Last day-end block's end date — but only once the borehole is actually finished, i.e. the
 * final block is an end-of-borehole marker. Preserved from `generatePdfPages.ts:29`, minus
 * its unguarded `blocks[blocks.length - 1]`, which threw on an empty borehole.
 */
function findDateFinished(blocks: Block[]): Date | null {
	const last = blocks[blocks.length - 1];
	if (last === undefined || last.blockTypeId !== END_OF_BOREHOLE_BLOCK_TYPE_ID) {
		return null;
	}
	return [...blocks].reverse().find((block) => block.dayWorkStatus.dayWorkStatusType === DAY_END_WORK_TYPE)?.dayWorkStatus.endDate ?? null;
}

export function buildReportDoc(input: ReportInput, measurer: TextMeasurer): ReportDoc {
	const geometry = createPageGeometry();
	const { pages: slices, warnings: paginationWarnings } = paginate(input.blocks);
	const flow = flowContent(slices, geometry, (block, testBlock) =>
		measureRowContent(block, testBlock, geometry, measurer),
	);

	const warnings: ReportWarning[] = [...paginationWarnings];
	const dateStarted = findDateStarted(input.blocks);
	const dateFinished = findDateFinished(input.blocks);
	const totalPages = flow.pages.length;
	const insets = separatorInsets(geometry, measurer);

	const pages: ReportPage[] = flow.pages.map((page) => {
		const nodes: DrawNode[] = [
			...buildHeader(input.project, input.borehole, geometry, page.pageNumber, totalPages, measurer),
			...buildColumnHeader(geometry),
			...buildFooter(input.borehole, geometry, dateStarted, dateFinished, measurer),
			...buildRuler(geometry, page.startTick),
			...buildSeparatorNodes(flow.separators, page.pageNumber - 1, geometry, insets),
		];

		const rows = page.parts.map((part) => buildBodyRow(part, BASE_FONT_SIZE_PT));
		nodes.push(...buildBodyNodes(rows, geometry, measurer));

		return { pageNumber: page.pageNumber, totalPages, nodes };
	});

	return {
		pageWidthPt: geometry.pageWidthPt,
		pageHeightPt: geometry.pageHeightPt,
		pages,
		warnings,
	};
}
