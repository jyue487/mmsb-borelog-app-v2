import { formatDdmmyyyy, formatHhmm, pyStrDateTime } from './excelDateTime';
import type { CellValue } from './readWorkbook';
import { pyFixed, pyFloatStr, pyParseFloat, pyParseInt, pyRound, pyStrip } from '../py/number';

/**
 * `utils/excel_input.py`, function for function, including what each does with a type it
 * did not expect — usually `str(value)`, which is how a missing time prints as `None`.
 */

/** Python `str(value)` of whatever openpyxl handed back. */
export function pyStr(value: CellValue): string {
	if (value === null) return 'None';
	if (typeof value === 'string') return value;
	if (typeof value === 'boolean') return value ? 'True' : 'False';
	if (value.kind === 'number') return value.isInt ? String(value.value) : pyFloatStr(value.value);
	return pyStrDateTime(value);
}

/** `isinstance(value, (int, float))` — a bool is an int in Python. */
function asNumber(value: CellValue): { value: number; isInt: boolean } | null {
	if (typeof value === 'boolean') return { value: value ? 1 : 0, isInt: true };
	if (value !== null && typeof value === 'object' && value.kind === 'number') return value;
	return null;
}

const isPyInt = (value: CellValue) => asNumber(value)?.isInt === true;

export function excelCellTo2dp(input: CellValue): string {
	if (input === null) return '';
	if (typeof input === 'string') {
		const parsed = pyParseFloat(input);
		return parsed === null ? input : pyFixed(parsed, 2);
	}
	const number = asNumber(input);
	if (number) return pyFixed(number.value, 2);
	return pyStr(input);
}

export function excelCellToPercentage(input: CellValue, withPercentSign = true): string {
	if (input === null) return '';
	const number = asNumber(input);
	if (number) {
		const result = String(pyRound(number.value * 100));
		return withPercentSign ? `${result}%` : result;
	}
	if (typeof input === 'string') {
		const stripped = pyStrip(input);
		// Python indexes stripped[-1] here and raises on an empty string; returning it is kinder.
		if (stripped.endsWith('%')) {
			const parsed = pyParseFloat(stripped.slice(0, -1));
			if (parsed === null || !Number.isFinite(parsed)) return stripped;
			const result = String(pyRound(parsed));
			return withPercentSign ? `${result}%` : result;
		}
		return stripped;
	}
	return pyStr(input);
}

export function excelCellToString(input: CellValue): string {
	return input === null ? '' : pyStr(input);
}

function padHhmm(n: number): string {
	return n >= 0 && n <= 9999 ? String(n).padStart(4, '0') : String(n);
}

export function excelCellToDatestringHhmm(input: CellValue): string {
	if (typeof input === 'string') {
		const stripped = pyStrip(input);
		const parsed = pyParseInt(stripped);
		return parsed === null ? stripped : padHhmm(parsed);
	}
	if (isPyInt(input)) return padHhmm(asNumber(input)!.value);
	if (input !== null && typeof input === 'object' && input.kind !== 'number') return formatHhmm(input);
	return pyStr(input);
}

function padDdmmyyyy(n: number): string {
	return n >= 1010000 && n <= 9129999 ? `0${n}` : String(n);
}

export function excelCellToDatestringDdmmyyyy(input: CellValue): string {
	if (typeof input === 'string') {
		const stripped = pyStrip(input);
		const parsed = pyParseInt(stripped);
		return parsed === null ? stripped : padDdmmyyyy(parsed);
	}
	if (isPyInt(input)) return padDdmmyyyy(asNumber(input)!.value);
	// `isinstance(input, (datetime, date))` — a bare `time` is neither, and falls through to str().
	if (input !== null && typeof input === 'object' && input.kind === 'datetime') return formatDdmmyyyy(input);
	return pyStr(input);
}

export function excelCellToInt(input: CellValue): number | null {
	if (input === null) return null;
	const number = asNumber(input);
	if (number) return number.isInt ? number.value : pyRound(number.value);
	if (typeof input === 'string') {
		const stripped = pyStrip(input);
		if (stripped === '') return null;
		const parsed = pyParseFloat(stripped);
		return parsed === null || !Number.isFinite(parsed) ? null : pyRound(parsed);
	}
	return null;
}

export function excelCellToIntNotNone(input: CellValue): number {
	return excelCellToInt(input) ?? 0;
}

export function excelCellToFloat(input: CellValue): number | null {
	if (input === null) return null;
	const number = asNumber(input);
	if (number) return number.value;
	if (typeof input === 'string') {
		const stripped = pyStrip(input);
		if (stripped === '') return null;
		return pyParseFloat(stripped);
	}
	return null;
}

export function excelCellToFloatNotNone(input: CellValue): number {
	return excelCellToFloat(input) ?? 0;
}
