import type { WorkbookRows } from '../model/rows';
import { cacheCell, numberCell, textCell, type CellValue, type SheetPatch } from './cells';
import { toExcelDateSerial } from './excelDate';
import {
	assertFits,
	CORE_SHEET,
	GEOLOGY_SHEET,
	HOLES_SHEET,
	PROGRESS_SHEET,
	PROJECT_SHEET_NAME,
	SAMPLES_SHEET,
	SPT_SHEET,
	WATER_STRIKE_SHEET,
	type SheetLayout,
} from './sheetLayout';

/**
 * Turns mapped rows into the cell patches the template needs.
 *
 * Column A of every data sheet is `PROJ_ID`, and it is a *formula* — `'Project - AGS'!A18`
 * on the first row, then a STOP sentinel that copies it. Its cached value in the blank
 * template is `0`, so the project code has to be written as a cache on every row we fill,
 * exactly like the SPT sheet's S and T.
 */

type Column = string;

/** Builds one row's patch, skipping any column whose value is null. */
function row(entries: readonly (readonly [Column, CellValue | null])[]): Map<Column, CellValue> {
	const patch = new Map<Column, CellValue>();
	for (const [column, value] of entries) {
		if (value !== null) {
			patch.set(column, value);
		}
	}
	return patch;
}

const optionalNumber = (value: number | null): CellValue | null =>
	value === null ? null : numberCell(value);
const optionalText = (value: string | null): CellValue | null =>
	value === null || value.length === 0 ? null : textCell(value);
const optionalDate = (value: Date | null): CellValue | null =>
	value === null ? null : numberCell(toExcelDateSerial(value));

function sheetPatch<T>(
	layout: SheetLayout,
	rows: readonly T[],
	projectCode: string,
	toRow: (item: T) => Map<Column, CellValue>,
): SheetPatch {
	assertFits(layout, rows.length);

	const patch = new Map<number, Map<Column, CellValue>>();
	rows.forEach((item, index) => {
		const cells = toRow(item);
		cells.set('A', cacheCell(projectCode));
		patch.set(layout.firstRow + index, cells);
	});
	return patch;
}

export function buildSheetPatches(rows: WorkbookRows): Map<string, SheetPatch> {
	const patches = new Map<string, SheetPatch>();
	const { projectCode } = rows;

	// Project - AGS: a fixed block of header cells, not a repeating grid. D9 (contractor),
	// D10 (date) and D11 (remarks) have no source and stay blank, as they are in the real
	// workbooks. A18 is the hidden AGS output row that every other sheet's column A points
	// at; caching it keeps the workbook internally coherent.
	patches.set(
		PROJECT_SHEET_NAME,
		new Map([
			[
				4,
				row([
					['D', optionalText(rows.projectTitle)],
					['I', textCell(projectCode)],
				]),
			],
			[6, row([['D', optionalText(rows.projectClient)]])],
			[7, row([['D', optionalText(rows.projectEngineer)]])],
			[8, row([['D', optionalText(rows.projectLocation)]])],
			[18, row([['A', cacheCell(projectCode)]])],
		]),
	);

	patches.set(
		HOLES_SHEET.name,
		sheetPatch(HOLES_SHEET, rows.holes, projectCode, (hole) =>
			row([
				['B', textCell(hole.holeId)],
				['C', optionalText(hole.holeType)],
				['D', optionalNumber(hole.eastingInMetres)],
				['E', optionalNumber(hole.northingInMetres)],
				['F', optionalNumber(hole.finalDepthInMetres)],
				['G', optionalNumber(hole.groundLevelInMetres)],
				['H', optionalDate(hole.startDate)],
				['I', optionalDate(hole.endDate)],
				['J', optionalDate(hole.backfillDate)],
				['K', optionalText(hole.logger)],
				['L', optionalText(hole.location)],
				['M', optionalText(hole.remarks)],
			]),
		),
	);

	patches.set(
		PROGRESS_SHEET.name,
		sheetPatch(PROGRESS_SHEET, rows.progress, projectCode, (entry) =>
			row([
				['B', textCell(entry.holeId)],
				['C', numberCell(toExcelDateSerial(entry.date))],
				// A bare integer, not a time serial: the consumer's reader takes 900 and 1730
				// and pads them to "0900" and "1730".
				['D', numberCell(entry.timeHhmm)],
				['E', optionalNumber(entry.holeDepthInMetres)],
				['F', optionalNumber(entry.casingDepthInMetres)],
				['G', optionalNumber(entry.waterDepthInMetres)],
			]),
		),
	);

	// Columns G (`WSTK_NMIN`), H (`WSTK_SEAL`) and I (`WSTK_FLOW`) have no source and are
	// left untouched — G in particular still carries the template's own autofill formula
	// from row 422 down. See `docs/follow-ups.md`.
	patches.set(
		WATER_STRIKE_SHEET.name,
		sheetPatch(WATER_STRIKE_SHEET, rows.waterStrikes, projectCode, (strike) =>
			row([
				['B', textCell(strike.holeId)],
				['C', numberCell(strike.depthInMetres)],
				['D', numberCell(toExcelDateSerial(strike.date))],
				// A bare integer, exactly as on Progress column D.
				['E', numberCell(strike.timeHhmm)],
				['F', optionalNumber(strike.casingDepthInMetres)],
			]),
		),
	);

	patches.set(
		SPT_SHEET.name,
		sheetPatch(SPT_SHEET, rows.spt, projectCode, (test) =>
			row([
				['B', textCell(test.holeId)],
				['C', numberCell(test.testDepthInMetres)],
				['G', optionalNumber(test.seatingBlows[0])],
				['H', optionalNumber(test.seatingPenetrationsMm[0])],
				['I', optionalNumber(test.seatingBlows[1])],
				['J', optionalNumber(test.seatingPenetrationsMm[1])],
				['K', optionalNumber(test.mainBlows[0])],
				['L', optionalNumber(test.mainPenetrationsMm[0])],
				['M', optionalNumber(test.mainBlows[1])],
				['N', optionalNumber(test.mainPenetrationsMm[1])],
				['O', optionalNumber(test.mainBlows[2])],
				['P', optionalNumber(test.mainPenetrationsMm[2])],
				['Q', optionalNumber(test.mainBlows[3])],
				['R', optionalNumber(test.mainPenetrationsMm[3])],
				// S and T are formulas. Their caches are what the report actually reads.
				['S', cacheCell(test.nValue)],
				['T', cacheCell(test.reportedResult)],
			]),
		),
	);

	patches.set(
		GEOLOGY_SHEET.name,
		sheetPatch(GEOLOGY_SHEET, rows.geology, projectCode, (stratum) =>
			row([
				['B', textCell(stratum.holeId)],
				['C', optionalText(stratum.geologyCode)],
				['D', optionalNumber(stratum.legendCode)],
				['E', numberCell(stratum.topDepthInMetres)],
				['F', numberCell(stratum.baseDepthInMetres)],
				['G', optionalText(stratum.description)],
				['H', optionalText(stratum.stratumReference)],
			]),
		),
	);

	patches.set(
		SAMPLES_SHEET.name,
		sheetPatch(SAMPLES_SHEET, rows.samples, projectCode, (sample) =>
			row([
				['B', textCell(sample.holeId)],
				['C', numberCell(sample.topDepthInMetres)],
				['D', numberCell(sample.baseDepthInMetres)],
				['E', optionalText(sample.sampleType)],
				['F', textCell(sample.sampleReference)],
				['G', optionalNumber(sample.diameterMm)],
				['H', optionalNumber(sample.recoveryFraction)],
			]),
		),
	);

	patches.set(
		CORE_SHEET.name,
		sheetPatch(CORE_SHEET, rows.core, projectCode, (core) =>
			row([
				['B', textCell(core.holeId)],
				['C', numberCell(core.topDepthInMetres)],
				['D', numberCell(core.baseDepthInMetres)],
				['E', optionalNumber(core.totalCoreRecoveryFraction)],
				['F', optionalNumber(core.solidCoreRecoveryFraction)],
				['G', optionalNumber(core.rockQualityDesignationFraction)],
				['H', optionalNumber(core.diameterMm)],
			]),
		),
	);

	return patches;
}
