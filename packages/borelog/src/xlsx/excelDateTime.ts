import { pyRound } from '../py/number';

/**
 * A date-formatted cell, as openpyxl's `from_excel` would have returned it: a `datetime`,
 * or a bare `time` for a serial in [0, 1). Fields are plain numbers in the workbook's own
 * wall-clock — there is no time zone anywhere in an Excel serial.
 */
export interface ExcelDateTime {
	readonly kind: 'datetime' | 'time';
	readonly year: number;
	readonly month: number;
	readonly day: number;
	readonly hour: number;
	readonly minute: number;
	readonly second: number;
}

const MS_PER_DAY = 86_400_000;
const WINDOWS_EPOCH_MS = Date.UTC(1899, 11, 30);
const MAC_EPOCH_MS = Date.UTC(1904, 0, 1);

/** openpyxl `utils.datetime.from_excel`, including its 1900-leap-year correction. */
export function excelSerialToDateTime(serial: number, date1904: boolean): ExcelDateTime {
	let day = Math.floor(serial);
	const fraction = serial - day;
	const ms = pyRound(fraction * MS_PER_DAY);
	if (serial >= 0 && serial < 1 && ms < MS_PER_DAY) {
		const t = new Date(ms);
		return { kind: 'time', year: 0, month: 0, day: 0, hour: t.getUTCHours(), minute: t.getUTCMinutes(), second: t.getUTCSeconds() };
	}
	if (!date1904 && serial > 0 && serial < 60) day += 1;
	const t = new Date((date1904 ? MAC_EPOCH_MS : WINDOWS_EPOCH_MS) + day * MS_PER_DAY + ms);
	return {
		kind: 'datetime',
		year: t.getUTCFullYear(),
		month: t.getUTCMonth() + 1,
		day: t.getUTCDate(),
		hour: t.getUTCHours(),
		minute: t.getUTCMinutes(),
		second: t.getUTCSeconds(),
	};
}

const pad = (n: number, width: number) => String(n).padStart(width, '0');

/** `strftime("%d/%m/%Y")` */
export function formatDdmmyyyy(dt: ExcelDateTime): string {
	return `${pad(dt.day, 2)}/${pad(dt.month, 2)}/${pad(dt.year, 4)}`;
}

/** `strftime("%H%M")` */
export function formatHhmm(dt: ExcelDateTime): string {
	return `${pad(dt.hour, 2)}${pad(dt.minute, 2)}`;
}

/** Python's `str()` of a `datetime` or a `time`. */
export function pyStrDateTime(dt: ExcelDateTime): string {
	const time = `${pad(dt.hour, 2)}:${pad(dt.minute, 2)}:${pad(dt.second, 2)}`;
	return dt.kind === 'time' ? time : `${pad(dt.year, 4)}-${pad(dt.month, 2)}-${pad(dt.day, 2)} ${time}`;
}
