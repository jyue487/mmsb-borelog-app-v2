/**
 * The blow counts at which an SPT drive is stopped as a refusal.
 *
 * The seating drive always stops at 25. The main drive stops at 50 under the usual standard,
 * but some clients specify 100 — so the main-drive limit belongs to the project. It is stored
 * on it as `projects.spt_n_max` (NOT NULL, default 50), edited by owners and admins from the
 * dashboard, and every surface that reads a blow count (the mobile form and its validation,
 * both apps' read-only views, the fieldlog and the AGS workbook) takes it from the project.
 */

export const SEATING_DRIVE_REFUSAL_BLOWS = 25;

export type MainDriveRefusalBlows = 50 | 100;

/** The values `projects.spt_n_max` may hold, in the order a picker offers them. */
export const SPT_N_MAX_OPTIONS: readonly MainDriveRefusalBlows[] = [50, 100];

export const DEFAULT_SPT_N_MAX: MainDriveRefusalBlows = 50;

/**
 * Reads `projects.spt_n_max` off a row.
 *
 * Null falls back to the default: the column is NOT NULL, but a local PowerSync row that has
 * not yet synced the column reads it as null. Any other value throws rather than quietly
 * becoming 50 — a 100-blow project logged against 50 cuts its blow counts short.
 */
export function parseSptNMax(value: unknown): MainDriveRefusalBlows {
	if (value === null || value === undefined) {
		return DEFAULT_SPT_N_MAX;
	}
	const n = Number(value);
	if (n === 50 || n === 100) {
		return n;
	}
	throw new Error(`Unsupported SPT-N Max: ${String(value)}. Expected 50 or 100.`);
}
