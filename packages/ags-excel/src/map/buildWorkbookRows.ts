import {
	CORING_BLOCK_TYPE_ID,
	DAY_END_WORK_TYPE,
	DAY_START_AND_END_WORK_TYPE,
	DAY_START_WORK_TYPE,
	END_OF_BOREHOLE_BLOCK_TYPE_ID,
	SPT_BLOCK_TYPE_ID,
	type Block,
	type DayWorkStatus,
} from '@mmsb/core';

import type { AgsBorehole, AgsExcelInput } from '../model/input';
import type {
	CoreRow,
	GeologyRow,
	HoleRow,
	ProgressRow,
	SampleRow,
	SptRow,
	WaterStrikeRow,
	WorkbookRows,
} from '../model/rows';
import { CONTRIBUTES_STRATUM, drilledDepthOf, sampleOf, stratumOf } from './blockFacts';
import { computeSptResult } from './sptResult';

/**
 * `HOLE_TYPE`. Every hole this app logs is rotary cored.
 *
 * The template already pre-fills the literal `RC` down column C from row 7, so writing it
 * explicitly changes nothing for the second hole onwards — it just stops the *first* hole,
 * on row 6, from being the only one exported without a type.
 */
const HOLE_TYPE_CODE = 'RC';

function byDepth(blocks: readonly Block[]): Block[] {
	// The `id` tiebreak is load-bearing, not cosmetic. Ties on depth are normal — an in-situ
	// test can start exactly at its host's top — and `Geology - AGS` now takes a row's base
	// depth from its neighbour, so an unstable tie order would change the numbers written,
	// not just the order they are written in. Same pair the clients sort on.
	return [...blocks].sort((a, b) => a.topDepthInMetres - b.topDepthInMetres || a.id.localeCompare(b.id));
}

function startsADay(status: DayWorkStatus): boolean {
	return (
		status.dayWorkStatusType === DAY_START_WORK_TYPE ||
		status.dayWorkStatusType === DAY_START_AND_END_WORK_TYPE
	);
}

function endsADay(status: DayWorkStatus): boolean {
	return (
		status.dayWorkStatusType === DAY_END_WORK_TYPE ||
		status.dayWorkStatusType === DAY_START_AND_END_WORK_TYPE
	);
}

/** Excel stores a clock time in this column as a bare integer: 09:00 is 900, 17:30 is 1730. */
function toHhmm(time: Date): number {
	return time.getHours() * 100 + time.getMinutes();
}

function buildHoleRow(entry: AgsBorehole, blocks: readonly Block[]): HoleRow {
	const { borehole } = entry;

	const start = blocks.find((block) => startsADay(block.dayWorkStatus));
	const end = [...blocks].reverse().find((block) => endsADay(block.dayWorkStatus));

	const endOfBorehole = blocks.find(
		(block) => block.blockTypeId === END_OF_BOREHOLE_BLOCK_TYPE_ID,
	);
	const finalDepth =
		endOfBorehole?.baseDepthInMetres ??
		(blocks.length === 0 ? null : Math.max(...blocks.map(drilledDepthOf)));

	return {
		holeId: borehole.name,
		holeType: HOLE_TYPE_CODE,
		eastingInMetres: borehole.eastingInMetres,
		northingInMetres: borehole.northingInMetres,
		finalDepthInMetres: finalDepth,
		groundLevelInMetres: borehole.reducedLevelInMetres,
		startDate: start?.dayWorkStatus.startDate ?? null,
		endDate: end?.dayWorkStatus.endDate ?? null,
		// Nothing in the data model records when a hole was backfilled.
		backfillDate: null,
		// `HOLE_LOG` is the only person on this sheet, and it is the driller — not the
		// `checkerName` the PDF footer prints on its "Checked by:" line.
		logger: borehole.drillerName,
		location: null,
		remarks: null,
	};
}

/**
 * Two rows per working day — the start and the end of each shift.
 *
 * The depth column is the hole's depth *at that moment*, so a day's start row repeats where
 * the previous day stopped, and the very first start row is blank because nothing has been
 * drilled yet. That is what a real workbook contains.
 */
function buildProgressRows(holeId: string, blocks: readonly Block[]): ProgressRow[] {
	const rows: ProgressRow[] = [];
	let deepestSoFar = 0;

	for (const block of blocks) {
		const status = block.dayWorkStatus;

		if (startsADay(status)) {
			rows.push({
				holeId,
				date: status.startDate,
				timeHhmm: toHhmm(status.startTime),
				holeDepthInMetres: deepestSoFar === 0 ? null : deepestSoFar,
				casingDepthInMetres: status.startCasingDepthInMetres,
				waterDepthInMetres: toWaterDepth(status.startWaterLevelInMetres),
			});
		}

		deepestSoFar = Math.max(deepestSoFar, drilledDepthOf(block));

		if (endsADay(status)) {
			rows.push({
				holeId,
				date: status.endDate,
				timeHhmm: toHhmm(status.endTime),
				holeDepthInMetres: deepestSoFar,
				casingDepthInMetres: status.endCasingDepthInMetres,
				waterDepthInMetres: toWaterDepth(status.endWaterLevelInMetres),
			});
		}
	}

	return rows;
}

/**
 * A water level may be a depth, or one of the sentinel strings `NIL` / `FULL`.
 *
 * The consumer's `excel_cell_to_2dp` passes a non-numeric string straight through, so the
 * sentinels survive; only a number needs to arrive as a number.
 */
function toWaterDepth(level: string | number | null): number | null {
	return typeof level === 'number' ? level : null;
}

/**
 * The water strikes, taken from the Progress rows rather than walking the shifts again.
 *
 * `buildProgressRows` already emits one entry per shift boundary and has already resolved
 * the water level — `toWaterDepth` returns null for the `NIL`/`FULL` sentinels, which is
 * exactly the filter this sheet wants: a strike with no depth is not a strike. Deriving
 * keeps the two sheets from drifting apart.
 */
function toWaterStrikeRows(rows: readonly ProgressRow[]): WaterStrikeRow[] {
	return rows.flatMap((entry) =>
		entry.waterDepthInMetres === null
			? []
			: [
					{
						holeId: entry.holeId,
						depthInMetres: entry.waterDepthInMetres,
						date: entry.date,
						timeHhmm: entry.timeHhmm,
						casingDepthInMetres: entry.casingDepthInMetres,
					},
				],
	);
}

function buildSptRows(holeId: string, blocks: readonly Block[]): SptRow[] {
	return blocks
		.filter((block) => block.blockTypeId === SPT_BLOCK_TYPE_ID)
		.map((block) => {
			const { nValue, reportedResult } = computeSptResult(block);
			return {
				holeId,
				testDepthInMetres: block.topDepthInMetres,
				seatingBlows: [block.seatingIncBlows1, block.seatingIncBlows2] as const,
				seatingPenetrationsMm: [block.seatingIncPen1, block.seatingIncPen2] as const,
				mainBlows: [
					block.mainIncBlows1,
					block.mainIncBlows2,
					block.mainIncBlows3,
					block.mainIncBlows4,
				] as const,
				mainPenetrationsMm: [
					block.mainIncPen1,
					block.mainIncPen2,
					block.mainIncPen3,
					block.mainIncPen4,
				] as const,
				nValue,
				reportedResult,
			};
		});
}

/**
 * A stratum runs until the next one starts, so `GEOL_BASE` is the *next* row's `GEOL_TOP`
 * rather than this block's own base depth. That is what makes the sheet a contiguous
 * partition of the hole instead of a list of disjoint intervals with voids between them.
 * Only the last row of the hole has no successor to take a base from, so it keeps its own.
 *
 * Every row chains, in-situ tests included: a test truncates the stratum above it and then
 * runs on to the next row's top.
 */
function buildGeologyRows(holeId: string, blocks: readonly Block[]): GeologyRow[] {
	const strata = blocks.filter((block) => CONTRIBUTES_STRATUM[block.blockTypeId]);

	return strata.map((block, index) => {
		const { description, legendCode } = stratumOf(block);
		const next = strata[index + 1];
		return {
			holeId,
			// Blank on every row of every real workbook we have.
			geologyCode: null,
			legendCode,
			topDepthInMetres: block.topDepthInMetres,
			baseDepthInMetres: next ? next.topDepthInMetres : block.baseDepthInMetres,
			description,
			stratumReference: null,
		};
	});
}

function buildSampleRows(holeId: string, blocks: readonly Block[]): SampleRow[] {
	const rows: SampleRow[] = [];

	for (const block of blocks) {
		const sample = sampleOf(block);
		if (sample === null) {
			continue;
		}
		rows.push({
			holeId,
			topDepthInMetres: block.topDepthInMetres,
			baseDepthInMetres: sample.baseDepthInMetres,
			sampleType: sample.sampleType,
			sampleReference: sample.sampleReference,
			// Sample diameter is not in the data model.
			diameterMm: null,
			recoveryFraction: sample.recoveryFraction,
		});
	}

	return rows;
}

function buildCoreRows(holeId: string, blocks: readonly Block[]): CoreRow[] {
	return blocks
		.filter((block) => block.blockTypeId === CORING_BLOCK_TYPE_ID)
		.map((block) => ({
			holeId,
			topDepthInMetres: block.topDepthInMetres,
			baseDepthInMetres: block.baseDepthInMetres,
			// The sheet's cells are percent-formatted, so they hold a fraction.
			totalCoreRecoveryFraction: block.coreRecoveryInPercentage / 100,
			// SCR and core diameter have no source in the data model. Real workbooks leave
			// both blank too, so this matches what a human produces rather than falling short.
			solidCoreRecoveryFraction: null,
			rockQualityDesignationFraction: block.rqdInPercentage / 100,
			diameterMm: null,
		}));
}

export function buildWorkbookRows(input: AgsExcelInput): WorkbookRows {
	const holes: HoleRow[] = [];
	const progress: ProgressRow[] = [];
	const spt: SptRow[] = [];
	const geology: GeologyRow[] = [];
	const samples: SampleRow[] = [];
	const core: CoreRow[] = [];
	const waterStrikes: WaterStrikeRow[] = [];

	for (const entry of input.boreholes) {
		// Blocks carry no stored order. Callers reindex on read, but sorting again here keeps
		// the mapping correct on its own terms — the Progress sheet's running depth and the
		// contiguity of every sheet both depend on depth order.
		const blocks = byDepth(entry.blocks);
		const holeId = entry.borehole.name;

		const progressRows = buildProgressRows(holeId, blocks);

		holes.push(buildHoleRow(entry, blocks));
		progress.push(...progressRows);
		waterStrikes.push(...toWaterStrikeRows(progressRows));
		spt.push(...buildSptRows(holeId, blocks));
		geology.push(...buildGeologyRows(holeId, blocks));
		samples.push(...buildSampleRows(holeId, blocks));
		core.push(...buildCoreRows(holeId, blocks));
	}

	return {
		projectCode: input.project.code,
		projectTitle: input.project.title,
		projectClient: input.project.client,
		projectLocation: input.project.location,
		// `PROJ_ENG` on the Project sheet's hidden AGS row, fed from D7. The consultant is the
		// engineer of record; nothing in the data model names the drilling contractor.
		projectEngineer: input.project.consultant,
		holes,
		progress,
		spt,
		geology,
		samples,
		core,
		waterStrikes,
	};
}
