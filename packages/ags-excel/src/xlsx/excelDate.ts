/**
 * Excel stores a date as a day count from a 1899-12-30 epoch — the offset that absorbs the
 * spreadsheet's deliberate 1900 leap-year bug for every date after February 1900.
 *
 * The cells we write into are already date-formatted in the template, so a serial written
 * there comes back out of openpyxl as a `datetime` rather than as a number.
 *
 * Local calendar fields are used on purpose: a borehole logged on the 15th should export as
 * the 15th, whatever the reader's timezone would make of the underlying instant.
 */

const EXCEL_EPOCH_UTC_MS = Date.UTC(1899, 11, 30);
const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function toExcelDateSerial(date: Date): number {
	const localMidnightUtcMs = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
	return Math.round((localMidnightUtcMs - EXCEL_EPOCH_UTC_MS) / MS_PER_DAY);
}
