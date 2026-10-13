import type {
	BoreholeInformation,
	CoreInformation,
	GeologyInformation,
	ProgressInformation,
	ProjectInformation,
	SampleInformation,
	SptInformation,
} from '../model';
import * as xl from '../xlsx/cellConvert';
import type { Worksheet } from '../xlsx/readWorkbook';

/**
 * `parsers/*.py`: the same cells, the same conversions. Each list sheet runs from its first
 * data row down to the first row whose column B (the hole id) is empty.
 */

const FIRST_DATA_ROW = 6;
const SPT_FIRST_DATA_ROW = 7;

function rowsUntilBlankB(ws: Worksheet, startRow: number): number[] {
	const rows: number[] = [];
	for (let row = startRow; ws.cell(`B${row}`) !== null; row++) rows.push(row);
	return rows;
}

export function parseProjectInformation(ws: Worksheet): ProjectInformation {
	return {
		name: xl.excelCellToString(ws.cell('D4')),
		id: xl.excelCellToString(ws.cell('I4')),
		client: xl.excelCellToString(ws.cell('D6')),
		engineer: xl.excelCellToString(ws.cell('D7')),
		location: xl.excelCellToString(ws.cell('D8')),
		contractor: xl.excelCellToString(ws.cell('D9')),
		date: xl.excelCellToString(ws.cell('D10')),
		remarks: xl.excelCellToString(ws.cell('D11')),
	};
}

/** The Python program read row 6 alone; every row is read here, for one workbook per project. */
export function parseBoreholeInformation(ws: Worksheet): BoreholeInformation[] {
	return rowsUntilBlankB(ws, FIRST_DATA_ROW).map((i) => ({
		projId: xl.excelCellToString(ws.cell(`A${i}`)),
		id: xl.excelCellToString(ws.cell(`B${i}`)),
		type: xl.excelCellToString(ws.cell(`C${i}`)),
		eastingInMetres: xl.excelCellToString(ws.cell(`D${i}`)),
		northingInMetres: xl.excelCellToString(ws.cell(`E${i}`)),
		finalDepthInMetres: xl.excelCellToFloatNotNone(ws.cell(`F${i}`)),
		glInMetres: xl.excelCellToString(ws.cell(`G${i}`)),
		startDate: xl.excelCellToDatestringDdmmyyyy(ws.cell(`H${i}`)),
		endDate: xl.excelCellToDatestringDdmmyyyy(ws.cell(`I${i}`)),
		backfillDate: xl.excelCellToDatestringDdmmyyyy(ws.cell(`J${i}`)),
		logger: xl.excelCellToString(ws.cell(`K${i}`)),
		location: xl.excelCellToString(ws.cell(`L${i}`)),
		generalRemarks: xl.excelCellToString(ws.cell(`M${i}`)),
	}));
}

export function parseProgressInformation(ws: Worksheet): ProgressInformation[] {
	return rowsUntilBlankB(ws, FIRST_DATA_ROW).map((i) => ({
		projId: xl.excelCellToString(ws.cell(`A${i}`)),
		bhId: xl.excelCellToString(ws.cell(`B${i}`)),
		dateOfProgress: xl.excelCellToDatestringDdmmyyyy(ws.cell(`C${i}`)),
		timeOfProgressHhmm: xl.excelCellToDatestringHhmm(ws.cell(`D${i}`)),
		holeDepthInMetres: xl.excelCellToFloatNotNone(ws.cell(`E${i}`)),
		casingDepthInMetres: xl.excelCellToFloat(ws.cell(`F${i}`)),
		waterLevelInMetres: xl.excelCellTo2dp(ws.cell(`G${i}`)),
	}));
}

export function parseSptInformation(ws: Worksheet): SptInformation[] {
	return rowsUntilBlankB(ws, SPT_FIRST_DATA_ROW).map((i) => ({
		projId: xl.excelCellToString(ws.cell(`A${i}`)),
		bhId: xl.excelCellToString(ws.cell(`B${i}`)),
		testDepthInMetres: xl.excelCellToFloatNotNone(ws.cell(`C${i}`)),
		// S and T are formulas; these are Excel's cached results, never recomputed here.
		nValue: xl.excelCellToIntNotNone(ws.cell(`S${i}`)),
		reportedResult: xl.excelCellToString(ws.cell(`T${i}`)),
	}));
}

export function parseGeologyInformation(ws: Worksheet): GeologyInformation[] {
	return rowsUntilBlankB(ws, FIRST_DATA_ROW).map((i) => ({
		projId: xl.excelCellToString(ws.cell(`A${i}`)),
		bhId: xl.excelCellToString(ws.cell(`B${i}`)),
		geologyCode: xl.excelCellToString(ws.cell(`C${i}`)),
		legendCode: xl.excelCellToString(ws.cell(`D${i}`)),
		topDepthInMetres: xl.excelCellToFloatNotNone(ws.cell(`E${i}`)),
		baseDepthInMetres: xl.excelCellToFloatNotNone(ws.cell(`F${i}`)),
		stratumDescription: xl.excelCellToString(ws.cell(`G${i}`)),
		stratumReference: xl.excelCellToString(ws.cell(`H${i}`)),
	}));
}

export function parseSampleInformation(ws: Worksheet): SampleInformation[] {
	return rowsUntilBlankB(ws, FIRST_DATA_ROW).map((i) => ({
		projId: xl.excelCellToString(ws.cell(`A${i}`)),
		bhId: xl.excelCellToString(ws.cell(`B${i}`)),
		topDepthInMetres: xl.excelCellToFloatNotNone(ws.cell(`C${i}`)),
		baseDepthInMetres: xl.excelCellToFloatNotNone(ws.cell(`D${i}`)),
		sampleType: xl.excelCellToString(ws.cell(`E${i}`)),
		sampleReference: xl.excelCellToString(ws.cell(`F${i}`)),
		sampleDiameter: xl.excelCellToString(ws.cell(`G${i}`)),
		sampleRecovery: xl.excelCellToPercentage(ws.cell(`H${i}`)),
	}));
}

export function parseCoreInformation(ws: Worksheet): CoreInformation[] {
	return rowsUntilBlankB(ws, FIRST_DATA_ROW).map((i) => ({
		projId: xl.excelCellToString(ws.cell(`A${i}`)),
		bhId: xl.excelCellToString(ws.cell(`B${i}`)),
		topDepthInMetres: xl.excelCellToFloatNotNone(ws.cell(`C${i}`)),
		baseDepthInMetres: xl.excelCellToFloatNotNone(ws.cell(`D${i}`)),
		tcr: xl.excelCellToPercentage(ws.cell(`E${i}`), false),
		scr: xl.excelCellToPercentage(ws.cell(`F${i}`), false),
		rqd: xl.excelCellToPercentage(ws.cell(`G${i}`), false),
		diameter: xl.excelCellToString(ws.cell(`H${i}`)),
	}));
}
