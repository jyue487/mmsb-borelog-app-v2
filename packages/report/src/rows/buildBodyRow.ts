import {
	DAY_CONTINUE_WORK_TYPE,
	DAY_END_WORK_TYPE,
	DAY_START_AND_END_WORK_TYPE,
	DAY_START_WORK_TYPE,
	type Block,
	type DayWorkStatus,
} from '@mmsb/core';

import { COLUMN_COUNT, DESCRIPTION_COLUMN, SPT_COLUMN_COUNT, SPT_COLUMN_START } from '../layout/constants';
import { emptyCell, type BodyRow, type PrefitDescription, type RowCell } from '../model/table';
import type { PlacedRow } from '../layout/paginate';
import {
	BLOCK_ROW_SPECS,
	contentFromDivided,
	depthLabels,
	descriptionTokens,
	sampleLabels,
} from './blockRowSpec';
import { getDate, getTime } from '../format/datetime';

/**
 * Builds the 14 cells of one body row from its spec.
 *
 * Every renderer emitted exactly these columns in this order — verified by counting `<td>`
 * plus colspans across all 19 old files, which all came to 14 — so the order lives here
 * once instead of being retyped per block type.
 *
 * Every cell is aligned to the top of the row. A block's row is as tall as its depth
 * interval, so centring a value in it floats it an arbitrary distance from the sample it
 * describes; the reader is scanning across a row, and wants the values to start on one
 * line. DATE & TIME is the exception, and only because it is genuinely two things: the
 * shift's start pinned to the top and its end pinned to the bottom.
 */

/** `renderWaterLevelToHtml.ts`: four-way null handling, and string values pass through. */
function waterLevelLines(dayWorkStatus: DayWorkStatus): string[] {
	if (dayWorkStatus.dayWorkStatusType === DAY_CONTINUE_WORK_TYPE) {
		return [];
	}
	const format = (value: number | string | null): string | null => {
		if (value === null) return null;
		return typeof value === 'string' ? value : value.toFixed(2);
	};
	const start = format(dayWorkStatus.startWaterLevelInMetres);
	const end = format(dayWorkStatus.endWaterLevelInMetres);
	return [start, end].filter((value): value is string => value !== null);
}

/**
 * Start-of-day text pins to the top of the cell, end-of-day to the bottom, however tall the
 * row is — `renderDayWorkStatusToHtml.ts` did this with `position: absolute` inset-0.
 *
 * The old markup also applied `transform: scale(0.67)` to these eight divs as a stand-in
 * for a font size it could not otherwise express. That becomes an explicit size on the
 * cell, which is exactly the "cleaner typography" the brief asked for.
 */
function dayWorkStatusCell(
	dayWorkStatus: DayWorkStatus,
	baseFontSizePt: number,
	showStart: boolean,
	showEnd: boolean,
): RowCell {
	const top: string[] = [];
	const bottom: string[] = [];

	const type = dayWorkStatus.dayWorkStatusType;
	if (showStart && (type === DAY_START_WORK_TYPE || type === DAY_START_AND_END_WORK_TYPE)) {
		top.push(getDate(dayWorkStatus.startDate), getTime(dayWorkStatus.startTime));
	}
	if (showEnd && (type === DAY_END_WORK_TYPE || type === DAY_START_AND_END_WORK_TYPE)) {
		bottom.push(getDate(dayWorkStatus.endDate), getTime(dayWorkStatus.endTime));
	}

	return {
		column: 0,
		colSpan: 1,
		content: { kind: 'pinned', top: top.filter((line) => line !== ''), bottom: bottom.filter((line) => line !== '') },
		align: 'center',
		valign: 'top',
		fontSizePt: +(baseFontSizePt * 0.67).toFixed(2),
	};
}

export function buildBodyRow(
	placed: PlacedRow,
	baseFontSizePt: number,
	prefit?: PrefitDescription,
): BodyRow {
	// Filler rows only need the previous row's column geometry so the vertical rules line up.
	if (placed.kind === 'empty') {
		const spec = BLOCK_ROW_SPECS[placed.referenceBlockTypeId];
		const merged = spec.sptLayout === 'mergedThree';
		return {
			startTick: placed.startTick,
			tickCount: placed.tickCount,
			mergedSptColumns: merged,
			cells: buildSptColumnCells(merged, undefined, undefined).concat([
				emptyCell(0),
				emptyCell(1),
				emptyCell(2),
				emptyCell(3),
				emptyCell(4),
				emptyCell(11),
				emptyCell(12),
				emptyCell(13),
			]),
		};
	}

	const { block, testBlock } = placed;
	const spec = BLOCK_ROW_SPECS[block.blockTypeId];
	const merged = spec.sptLayout === 'mergedThree';
	const cells: RowCell[] = [];

	// A block whose depth interval crosses a page break is drawn as two or more parts, and
	// only the first carries its identity. Reprinting `P3`, its depths and its blow counts on
	// the next page would read as a second sample taken at a second depth; the continuation
	// is the rest of the description and nothing else. The cells still have to be emitted
	// empty rather than omitted, because the grid stroker takes the row's vertical rules from
	// its cell boundaries and `assertRowOccupancy` requires all 14 columns to be tiled.
	const isContinuation = placed.partIndex > 0;

	// 0 — DATE & TIME. The exception, because it is not a value but two pins: the shift's
	// start at the top of the cell and its end at the bottom. On a split the end has to
	// travel to the LAST part, or it would mark the page break instead of the end of shift.
	cells.push(
		spec.usesDayWorkStatus
			? dayWorkStatusCell(block.dayWorkStatus, baseFontSizePt, !isContinuation, placed.isFinalPart)
			: endOfBoreholeDateTimeCell(block, baseFontSizePt, !isContinuation),
	);

	// 1 — SAMPLING / TESTING / CORING
	cells.push({
		column: 1,
		colSpan: 1,
		content: isContinuation ? { kind: 'empty' } : linesContent(sampleLabels(block, testBlock)),
		align: 'center',
		valign: 'top',
	});

	// 2 — DEPTH
	cells.push({
		column: 2,
		colSpan: 1,
		content: isContinuation ? { kind: 'empty' } : linesContent(depthLabels(block, testBlock)),
		align: 'center',
		valign: 'top',
	});

	// 3 — WL
	cells.push({
		column: 3,
		colSpan: 1,
		content: isContinuation
			? { kind: 'empty' }
			: spec.usesDayWorkStatus
				? linesContent(waterLevelLines(block.dayWorkStatus))
				: linesContent(endOfBoreholeWaterLevelLines(block)),
		align: 'center',
		valign: 'top',
	});

	// 4 — DESCRIPTION. The only column that continues. `prefit` is set for a split block, and
	// holds this part's share of a layout agreed across all of them; see fitDescriptions.ts.
	cells.push({
		column: DESCRIPTION_COLUMN,
		colSpan: 1,
		content: { kind: 'rich', tokens: descriptionTokens(block, testBlock), prefit },
		align: 'left',
		valign: 'top',
	});

	// 5-10 — the SPT band
	cells.push(
		...buildSptColumnCells(
			merged,
			isContinuation ? undefined : spec.sptCells?.(block),
			isContinuation ? undefined : spec.mergedCells?.(block),
		),
	);

	// 11 — SPT (N)
	cells.push({
		column: 11,
		colSpan: 1,
		content:
			isContinuation || spec.sptN === undefined ? { kind: 'empty' } : contentFromDivided(spec.sptN(block)),
		align: 'center',
		valign: 'top',
	});

	// 12 — R/r
	const recovery = isContinuation ? '' : (spec.recovery?.(block) ?? '');
	cells.push({
		column: 12,
		colSpan: 1,
		content: recovery === '' ? { kind: 'empty' } : { kind: 'lines', lines: [recovery] },
		align: 'center',
		valign: 'top',
	});

	// 13 — SCALE. The ruler is drawn once per page, not per row, so the cell is a placeholder
	// that only contributes its column boundary to the grid.
	cells.push(emptyCell(13));

	return { startTick: placed.startTick, tickCount: placed.tickCount, cells, mergedSptColumns: merged };
}

function linesContent(lines: string[]) {
	return lines.length === 0 ? ({ kind: 'empty' } as const) : ({ kind: 'lines', lines } as const);
}

function buildSptColumnCells(
	merged: boolean,
	sixValues: ReturnType<NonNullable<import('./blockRowSpec').BlockRowSpec['sptCells']>> | undefined,
	threeValues: string[] | undefined,
): RowCell[] {
	if (merged) {
		return [0, 1, 2].map((i) => ({
			column: SPT_COLUMN_START + i * 2,
			colSpan: 2,
			content:
				threeValues === undefined || threeValues[i] === undefined || threeValues[i] === ''
					? ({ kind: 'empty' } as const)
					: ({ kind: 'lines', lines: [threeValues[i]] } as const),
			align: 'center' as const,
			valign: 'top' as const,
		}));
	}
	return Array.from({ length: SPT_COLUMN_COUNT }, (_, i) => ({
		column: SPT_COLUMN_START + i,
		colSpan: 1,
		content: sixValues === undefined ? ({ kind: 'empty' } as const) : contentFromDivided(sixValues[i]),
		align: 'center' as const,
		valign: 'top' as const,
	}));
}

/** End of borehole prints its installation date/time instead of a day-work status. */
function endOfBoreholeDateTimeCell(block: Block, baseFontSizePt: number, show: boolean): RowCell {
	const lines: string[] = [];
	if (show && block.blockTypeId === 11 && block.installationDate !== null) {
		lines.push(getDate(block.installationDate));
		if (block.installationTime !== null) {
			lines.push(getTime(block.installationTime));
		}
	}
	return {
		column: 0,
		colSpan: 1,
		content: lines.length === 0 ? { kind: 'empty' } : { kind: 'lines', lines },
		align: 'center',
		valign: 'top',
		fontSizePt: +(baseFontSizePt * 0.67).toFixed(2),
	};
}

function endOfBoreholeWaterLevelLines(block: Block): string[] {
	if (block.blockTypeId !== 11) {
		return [];
	}
	const value = block.waterLevelInMetres;
	if (value === null) {
		return [];
	}
	return [typeof value === 'string' ? value : value.toFixed(2)];
}

/**
 * Guards the invariant the old code only held by convention: the cells of a row must tile
 * all 14 columns exactly once, with no gap and no overlap. A mismatch means a block type
 * would silently print into the wrong column.
 */
export function assertRowOccupancy(row: BodyRow): void {
	const occupied = new Array<number>(COLUMN_COUNT).fill(0);
	for (const cell of row.cells) {
		for (let i = 0; i < cell.colSpan; i++) {
			occupied[cell.column + i] += 1;
		}
	}
	const bad = occupied.findIndex((count) => count !== 1);
	if (bad !== -1) {
		throw new Error(`row covers column ${bad} ${occupied[bad]} time(s), expected exactly 1`);
	}
}
