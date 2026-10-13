import type { BorelogData, BoreholeInformation, ProjectInformation } from '../model';
import { readWorkbook, type Workbook } from '../xlsx/readWorkbook';
import {
	parseBoreholeInformation,
	parseCoreInformation,
	parseGeologyInformation,
	parseProgressInformation,
	parseProjectInformation,
	parseSampleInformation,
	parseSptInformation,
} from './parseSheets';

export const PROJECT_SHEET_NAME = 'Project - AGS';
export const HOLES_SHEET_NAME = 'Holes - AGS';
export const PROGRESS_SHEET_NAME = 'Progress - AGS';
export const SPT_SHEET_NAME = 'SPT - AGS';
export const SPT_2_SHEET_NAME = 'SPT - AGS (2)';
export const GEOLOGY_SHEET_NAME = 'Geology - AGS';
export const SAMPLES_SHEET_NAME = 'Samples - AGS';
export const CORE_SHEET_NAME = 'Core - AGS';

export interface BorelogWorkbook {
	project: ProjectInformation;
	/** Every hole on `Holes - AGS`, in sheet order. */
	boreholes: BoreholeInformation[];
	/** The data one borelog is drawn from. Throws for a hole with nothing to draw. */
	borelogData(boreholeId: string): BorelogData;
}

/**
 * Finds each sheet the way `generate_borelog_pdf.py` did: by trimmed name, preferring
 * `SPT - AGS (2)` over `SPT - AGS` when a workbook carries both, with the same error when
 * one is missing.
 */
function findSheetNames(wb: Workbook) {
	// Last one wins on a duplicate trimmed name, as the Python loop reassigned — except a
	// plain `SPT - AGS`, which it only took while it had none.
	const byTrimmed = new Map<string, string>();
	let firstPlainSpt: string | undefined;
	for (const name of wb.sheetNames) {
		const trimmed = name.trim();
		byTrimmed.set(trimmed, name);
		if (trimmed === SPT_SHEET_NAME) firstPlainSpt ??= name;
	}
	if (firstPlainSpt !== undefined) byTrimmed.set(SPT_SHEET_NAME, firstPlainSpt);
	const find = (name: string) => {
		const actual = byTrimmed.get(name);
		if (actual === undefined) {
			throw new Error(`Excel sheet name not found. Please check naming for this sheet: ${name}`);
		}
		return actual;
	};
	const spt = byTrimmed.get(SPT_2_SHEET_NAME) ?? byTrimmed.get(SPT_SHEET_NAME);
	return {
		project: find(PROJECT_SHEET_NAME),
		holes: find(HOLES_SHEET_NAME),
		progress: find(PROGRESS_SHEET_NAME),
		spt: spt ?? find(SPT_SHEET_NAME),
		geology: find(GEOLOGY_SHEET_NAME),
		samples: find(SAMPLES_SHEET_NAME),
		core: find(CORE_SHEET_NAME),
	};
}

export function parseBorelogWorkbook(bytes: Uint8Array): BorelogWorkbook {
	const wb = readWorkbook(bytes);
	const names = findSheetNames(wb);
	const project = parseProjectInformation(wb.sheet(names.project));
	const boreholes = parseBoreholeInformation(wb.sheet(names.holes));
	const progress = parseProgressInformation(wb.sheet(names.progress));
	const spt = parseSptInformation(wb.sheet(names.spt));
	const geology = parseGeologyInformation(wb.sheet(names.geology));
	const samples = parseSampleInformation(wb.sheet(names.samples));
	const cores = parseCoreInformation(wb.sheet(names.core));

	return {
		project,
		boreholes,
		borelogData(boreholeId) {
			const borehole = boreholes.find((b) => b.id === boreholeId);
			if (borehole === undefined) throw new Error(`Borehole "${boreholeId}" is not on the ${HOLES_SHEET_NAME} sheet.`);
			// With one hole on the workbook every row belongs to it, filtered or not — which
			// is what the Python program assumed. Not filtering then also keeps a row whose
			// hole id was typed slightly differently, exactly as it used to be kept.
			const ofHole = <T extends { bhId: string }>(rows: T[]) =>
				boreholes.length === 1 ? rows : rows.filter((row) => row.bhId.trim() === borehole.id.trim());
			const data: BorelogData = {
				project,
				borehole,
				progress: ofHole(progress),
				spt: ofHole(spt),
				geology: ofHole(geology),
				samples: ofHole(samples),
				cores: ofHole(cores),
			};
			if (data.progress.length === 0) {
				throw new Error(`Borehole ${borehole.id} has no rows on the ${PROGRESS_SHEET_NAME} sheet, so its depth is unknown.`);
			}
			if (data.geology.length === 0) {
				throw new Error(`Borehole ${borehole.id} has no rows on the ${GEOLOGY_SHEET_NAME} sheet.`);
			}
			return data;
		},
	};
}
