/**
 * The blow counts at which an SPT drive is stopped as a refusal.
 *
 * The seating drive always stops at 25. The main drive stops at 50 under the usual standard,
 * but some clients specify 100 — so the main-drive limit belongs to the project, and every
 * surface that reads a blow count (the mobile form and its validation, both apps' read-only
 * views, the PDF report and the AGS workbook) asks this one function for it. None of them
 * keeps its own list of project codes.
 *
 * Keyed on the project code rather than stored on the project: it is rare enough not to
 * earn a column, at the cost that adding a project here needs an `eas update` and a
 * dashboard deploy to reach the field.
 */

export const SEATING_DRIVE_REFUSAL_BLOWS = 25;

export type MainDriveRefusalBlows = 50 | 100;

/** Projects whose client specifies a 100-blow main drive. */
const SPT100_PROJECT_CODES: ReadonlySet<string> = new Set<string>([]);

export function getMainDriveRefusalBlows(projectCode: string): MainDriveRefusalBlows {
	return SPT100_PROJECT_CODES.has(projectCode) ? 100 : 50;
}
