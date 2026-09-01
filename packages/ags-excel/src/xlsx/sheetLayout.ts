/**
 * Where each AGS sheet's data starts, and how far it goes.
 *
 * The first data row differs per sheet — SPT's header block is one row taller than the
 * others — and every sheet terminates its own AGS output at the first row whose key cells
 * are empty (`A6 = IF(AND(B6="",C6=""),"STOP",$A$7)`). The consumer's parsers stop the same
 * way, on the first empty column B. So rows must be written contiguously from `firstRow`,
 * with no gaps.
 *
 * `lastRow` is how far the template actually pre-declares its input cells. Geology is
 * dimensioned to 10005 but its final row is short of cells, so 10004 is the true limit.
 */
export interface SheetLayout {
	readonly name: string;
	readonly firstRow: number;
	readonly lastRow: number;
}

export const HOLES_SHEET: SheetLayout = { name: 'Holes - AGS', firstRow: 6, lastRow: 5000 };
export const PROGRESS_SHEET: SheetLayout = { name: 'Progress - AGS', firstRow: 6, lastRow: 5000 };
export const SPT_SHEET: SheetLayout = { name: 'SPT - AGS', firstRow: 7, lastRow: 5000 };
export const GEOLOGY_SHEET: SheetLayout = { name: 'Geology - AGS', firstRow: 6, lastRow: 10004 };
export const SAMPLES_SHEET: SheetLayout = { name: 'Samples - AGS', firstRow: 6, lastRow: 5000 };
export const CORE_SHEET: SheetLayout = { name: 'Core - AGS', firstRow: 6, lastRow: 5000 };
export const WATER_STRIKE_SHEET: SheetLayout = {
	name: 'Water Strike - AGS',
	firstRow: 6,
	lastRow: 5000,
};
export const PROJECT_SHEET_NAME = 'Project - AGS';

export function assertFits(layout: SheetLayout, rowCount: number): void {
	const capacity = layout.lastRow - layout.firstRow + 1;
	if (rowCount > capacity) {
		throw new Error(
			`${rowCount} rows do not fit on "${layout.name}", which has room for ${capacity}. ` +
				`Export fewer boreholes at a time — silently truncating would lose data from the report.`,
		);
	}
}
