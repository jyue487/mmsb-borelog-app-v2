import { strFromU8, unzipSync } from 'fflate';

import { excelSerialToDateTime, type ExcelDateTime } from './excelDateTime';

/**
 * Reads an .xlsx the way `openpyxl.load_workbook(data_only=True)` does — which is how the
 * Python program read it, so the values every parser sees are the values it saw.
 *
 * That means three things. Formulas are never evaluated: a cell yields the `<v>` Excel last
 * cached beside its `<f>`. A number is an int unless its text has a `.` or an exponent,
 * because Python formats the two differently (`34` vs `34.0`). And a number whose cell
 * style has a date format becomes a date or a time, exactly as openpyxl decides it.
 *
 * Only the parts named in `sheetNames` are decompressed: the AGS SPT sheet alone carries
 * 120,310 shared formulas, and the borelog reads seven of the eleven sheets.
 */

export type CellValue = string | ExcelNumber | boolean | ExcelDateTime | null;

export interface ExcelNumber {
	readonly kind: 'number';
	readonly value: number;
	/** openpyxl's `_cast_number`: an int when the stored text has no `.`, `E` or `e`. */
	readonly isInt: boolean;
}

export interface Worksheet {
	readonly name: string;
	cell(address: string): CellValue;
}

export interface Workbook {
	/** Sheet names in workbook order, as written (not trimmed). */
	readonly sheetNames: readonly string[];
	sheet(name: string): Worksheet;
}

const WORKBOOK_PART = 'xl/workbook.xml';
const WORKBOOK_RELS_PART = 'xl/_rels/workbook.xml.rels';
const SHARED_STRINGS_PART = 'xl/sharedStrings.xml';
const STYLES_PART = 'xl/styles.xml';

export function readWorkbook(bytes: Uint8Array): Workbook {
	let files: Record<string, Uint8Array>;
	try {
		// First pass: everything but worksheets, which are decompressed on demand below.
		files = unzipSync(bytes, { filter: (file) => !file.name.startsWith('xl/worksheets/') });
	} catch {
		throw new Error('This file is not an .xlsx workbook.');
	}

	const workbookXml = requireText(files, WORKBOOK_PART);
	const partBySheetName = resolveSheetParts(workbookXml, requireText(files, WORKBOOK_RELS_PART));
	const sharedStrings = files[SHARED_STRINGS_PART] ? parseSharedStrings(xmlText(files[SHARED_STRINGS_PART])) : [];
	const styles = files[STYLES_PART] ? parseDateStyles(xmlText(files[STYLES_PART])) : NO_DATE_STYLES;
	const date1904 = /<workbookPr\b[^>]*\bdate1904="(1|true)"/.test(workbookXml);

	const cache = new Map<string, Worksheet>();
	return {
		sheetNames: [...partBySheetName.keys()],
		sheet(name) {
			const cached = cache.get(name);
			if (cached) return cached;
			const part = partBySheetName.get(name);
			if (part === undefined) throw new Error(`The workbook has no sheet named "${name}".`);
			const xml = xmlText(requirePart(unzipSync(bytes, { filter: (file) => file.name === part }), part));
			const cells = parseSheetCells(xml, sharedStrings, styles, date1904);
			const sheet: Worksheet = { name, cell: (address) => cells.get(address) ?? null };
			cache.set(name, sheet);
			return sheet;
		},
	};
}

function requirePart(files: Record<string, Uint8Array>, part: string): Uint8Array {
	const bytes = files[part];
	if (bytes === undefined) throw new Error(`The workbook is missing ${part}.`);
	return bytes;
}

function requireText(files: Record<string, Uint8Array>, part: string): string {
	return xmlText(requirePart(files, part));
}

/**
 * The part as text, with XML's end-of-line normalisation applied (CRLF and lone CR become
 * LF before anything is parsed) — what openpyxl's XML parser hands it, so a typed line
 * break reads back as `\n`. A `_x000D_` escape survives this and becomes `\r` later.
 */
function xmlText(bytes: Uint8Array): string {
	return strFromU8(bytes).replace(/\r\n?/g, '\n');
}

function attr(tag: string, name: string): string | undefined {
	const match = new RegExp(`\\s${name}="([^"]*)"`).exec(tag);
	return match ? decodeXml(match[1]) : undefined;
}

/** Sheet display names → part paths, in workbook order. */
function resolveSheetParts(workbookXml: string, relsXml: string): Map<string, string> {
	const targetByRelId = new Map<string, string>();
	for (const [tag] of relsXml.matchAll(/<Relationship\b[^>]*>/g)) {
		const id = attr(tag, 'Id');
		const target = attr(tag, 'Target');
		if (id !== undefined && target !== undefined) {
			// Targets are relative to xl/, and may or may not be written absolutely.
			targetByRelId.set(id, `xl/${target.replace(/^\/?xl\//, '').replace(/^\//, '')}`);
		}
	}
	const partBySheetName = new Map<string, string>();
	for (const [tag] of workbookXml.matchAll(/<sheet\b[^>]*>/g)) {
		const name = attr(tag, 'name');
		const relId = attr(tag, 'r:id');
		const target = relId === undefined ? undefined : targetByRelId.get(relId);
		if (name !== undefined && target !== undefined) partBySheetName.set(name, target);
	}
	return partBySheetName;
}

const XML_ENTITIES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" };

function decodeXml(text: string): string {
	return text.replace(/&(#x[0-9a-fA-F]+|#[0-9]+|[a-z]+);/g, (whole, entity: string) => {
		if (entity.startsWith('#x')) return String.fromCodePoint(parseInt(entity.slice(2), 16));
		if (entity.startsWith('#')) return String.fromCodePoint(parseInt(entity.slice(1), 10));
		return XML_ENTITIES[entity] ?? whole;
	});
}

/** openpyxl's `unescape`: `_x000D_` → `\r`, the OOXML escape for characters XML cannot carry. */
function unescapeOoxml(text: string): string {
	return text.replace(/_x([0-9A-Fa-f]{4})_/g, (_, hex: string) => String.fromCharCode(parseInt(hex, 16)));
}

/** Concatenated `<t>` text of a string item, skipping phonetic runs (`<rPh>`), as openpyxl's `Text.content`. */
function stringItemText(itemXml: string): string {
	const withoutPhonetic = itemXml.replace(/<rPh\b[\s\S]*?<\/rPh>/g, '');
	let text = '';
	for (const match of withoutPhonetic.matchAll(/<t\b[^>]*?(?:\/>|>([\s\S]*?)<\/t>)/g)) {
		text += decodeXml(match[1] ?? '');
	}
	return unescapeOoxml(text);
}

function parseSharedStrings(xml: string): string[] {
	const strings: string[] = [];
	for (const match of xml.matchAll(/<si\b[^>]*?(?:\/>|>([\s\S]*?)<\/si>)/g)) {
		strings.push(stringItemText(match[1] ?? ''));
	}
	return strings;
}

interface DateStyles {
	/** Indexes into cellXfs whose number format is a date/time format. */
	readonly dateStyleIds: ReadonlySet<number>;
	/** Of those, the ones that are elapsed-time formats like `[h]:mm:ss`. */
	readonly timedeltaStyleIds: ReadonlySet<number>;
}

const NO_DATE_STYLES: DateStyles = { dateStyleIds: new Set(), timedeltaStyleIds: new Set() };

/** openpyxl's BUILTIN_FORMATS, the date-relevant part of it. Other builtin ids are not dates. */
const BUILTIN_FORMATS: Record<number, string> = {
	14: 'mm-dd-yy',
	15: 'd-mmm-yy',
	16: 'd-mmm',
	17: 'mmm-yy',
	18: 'h:mm AM/PM',
	19: 'h:mm:ss AM/PM',
	20: 'h:mm',
	21: 'h:mm:ss',
	22: 'm/d/yy h:mm',
	45: 'mm:ss',
	46: '[h]:mm:ss',
	47: 'mmss.0',
};

/** openpyxl `is_date_format`. */
export function isDateFormat(format: string | undefined): boolean {
	if (format === undefined) return false;
	const first = format.split(';')[0];
	const stripped = first.replace(/".*?"|\[(?!hh?\]|mm?\]|ss?\])[^\]]*\]/g, '');
	return /(?<![_\\])[dmhysDMHYS]/.test(stripped);
}

/** openpyxl `is_timedelta_format`. */
function isTimedeltaFormat(format: string | undefined): boolean {
	if (format === undefined) return false;
	return /\[hh?\](:mm(:ss(\.0*)?)?)?|\[mm?\](:ss(\.0*)?)?|\[ss?\](\.0*)?/i.test(format.split(';')[0]);
}

function parseDateStyles(xml: string): DateStyles {
	const customFormats = new Map<number, string>();
	for (const [tag] of xml.matchAll(/<numFmt\b[^>]*>/g)) {
		const id = attr(tag, 'numFmtId');
		const code = attr(tag, 'formatCode');
		if (id !== undefined && code !== undefined) customFormats.set(Number(id), code);
	}
	const dateStyleIds = new Set<number>();
	const timedeltaStyleIds = new Set<number>();
	const cellXfs = /<cellXfs\b[^>]*>([\s\S]*?)<\/cellXfs>/.exec(xml)?.[1] ?? '';
	let index = 0;
	for (const [tag] of cellXfs.matchAll(/<xf\b[^>]*>/g)) {
		const numFmtId = Number(attr(tag, 'numFmtId') ?? 0);
		const format = customFormats.get(numFmtId) ?? BUILTIN_FORMATS[numFmtId];
		if (isDateFormat(format)) {
			dateStyleIds.add(index);
			if (isTimedeltaFormat(format)) timedeltaStyleIds.add(index);
		}
		index++;
	}
	return { dateStyleIds, timedeltaStyleIds };
}

function parseSheetCells(
	xml: string,
	sharedStrings: readonly string[],
	styles: DateStyles,
	date1904: boolean,
): Map<string, CellValue> {
	const cells = new Map<string, CellValue>();
	const sheetData = /<sheetData\b[^>]*>([\s\S]*?)<\/sheetData>/.exec(xml)?.[1] ?? '';
	// `<c .../>` (empty, styled — the template pre-declares thousands) or `<c ...>...</c>`.
	for (const match of sheetData.matchAll(/<c\b([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g)) {
		const body = match[2];
		if (body === undefined) continue;
		const open = match[1];
		const address = attr(open, 'r');
		if (address === undefined) continue;
		const value = parseCellValue(attr(open, 't') ?? 'n', Number(attr(open, 's') ?? 0), body, sharedStrings, styles, date1904);
		if (value !== null) cells.set(address, value);
	}
	return cells;
}

function parseCellValue(
	type: string,
	styleId: number,
	body: string,
	sharedStrings: readonly string[],
	styles: DateStyles,
	date1904: boolean,
): CellValue {
	if (type === 'inlineStr') {
		const inline = /<is\b[^>]*>([\s\S]*?)<\/is>/.exec(body);
		return inline ? stringItemText(inline[1]) : null;
	}
	// `findtext(VALUE_TAG) or None`: an empty cached value is no value.
	const raw = /<v\b[^>]*>([\s\S]*?)<\/v>/.exec(body)?.[1];
	if (raw === undefined || raw === '') return null;
	const text = decodeXml(raw);
	switch (type) {
		case 'n': {
			const isInt = !/[.eE]/.test(text);
			const value = Number(text);
			if (styles.dateStyleIds.has(styleId) && !styles.timedeltaStyleIds.has(styleId)) {
				return excelSerialToDateTime(value, date1904);
			}
			return { kind: 'number', value, isInt };
		}
		case 's':
			return sharedStrings[Number(text)] ?? null;
		case 'b':
			return text !== '0';
		case 'str':
		case 'e':
			return unescapeOoxml(text);
		default:
			return text;
	}
}
