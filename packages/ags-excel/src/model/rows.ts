/**
 * One type per AGS sheet, in the sheet's own column order.
 *
 * This is the seam: `map/` turns blocks into these, and `writeRows.ts` turns these into
 * cells. Neither half needs to know about the other, so the mapping is testable without a
 * template and the writing is testable without a borehole.
 *
 * `null` means "leave the cell empty" throughout — either because the data model has no
 * source for it, or because a human leaves it blank too.
 */

export interface HoleRow {
	readonly holeId: string;
	/** `HOLE_TYPE` — an AGS code such as `RC`. Not derivable from free-text `typeOfBoring`. */
	readonly holeType: string | null;
	readonly eastingInMetres: number | null;
	readonly northingInMetres: number | null;
	readonly finalDepthInMetres: number | null;
	readonly groundLevelInMetres: number | null;
	readonly startDate: Date | null;
	readonly endDate: Date | null;
	readonly backfillDate: Date | null;
	readonly logger: string | null;
	readonly location: string | null;
	readonly remarks: string | null;
}

export interface ProgressRow {
	readonly holeId: string;
	readonly date: Date;
	/** Written as a bare integer, e.g. 900 or 1730 — not a time serial. */
	readonly timeHhmm: number;
	readonly holeDepthInMetres: number | null;
	readonly casingDepthInMetres: number | null;
	readonly waterDepthInMetres: number | null;
}

export interface SptRow {
	readonly holeId: string;
	readonly testDepthInMetres: number;
	/** Seating drive: two increments. `null` blows means the increment was not driven. */
	readonly seatingBlows: readonly [number | null, number | null];
	readonly seatingPenetrationsMm: readonly [number | null, number | null];
	/** Main drive: four increments. */
	readonly mainBlows: readonly [number | null, number | null, number | null, number | null];
	readonly mainPenetrationsMm: readonly [number | null, number | null, number | null, number | null];
	/** Cached result for column S, which the template computes with a formula. */
	readonly nValue: number;
	/** Cached result for column T — the string the report prints. */
	readonly reportedResult: string;
}

export interface GeologyRow {
	readonly holeId: string;
	/** `GEOL_GEOL`. Blank on every row of every real workbook we have. */
	readonly geologyCode: string | null;
	/** `GEOL_LEG` — selects the hatch image the report draws for this stratum. */
	readonly legendCode: number | null;
	readonly topDepthInMetres: number;
	/** The *next* row's top depth, not the block's own base — a stratum runs until the next starts. */
	readonly baseDepthInMetres: number;
	readonly description: string;
	readonly stratumReference: string | null;
}

export interface SampleRow {
	readonly holeId: string;
	readonly topDepthInMetres: number;
	/** Top + recovered length, *not* the block's base depth. */
	readonly baseDepthInMetres: number;
	readonly sampleType: string | null;
	readonly sampleReference: string;
	readonly diameterMm: number | null;
	/** A fraction in 0..1, not a percentage — the cells are percent-formatted. */
	readonly recoveryFraction: number | null;
}

export interface CoreRow {
	readonly holeId: string;
	readonly topDepthInMetres: number;
	readonly baseDepthInMetres: number;
	/** Fractions in 0..1. `scr` and `diameter` have no source in the data model. */
	readonly totalCoreRecoveryFraction: number | null;
	readonly solidCoreRecoveryFraction: number | null;
	readonly rockQualityDesignationFraction: number | null;
	readonly diameterMm: number | null;
}

/**
 * `WSTK`. One entry per shift boundary that recorded an actual water level.
 *
 * `WSTK_NMIN`, `WSTK_SEAL` and `WSTK_FLOW` have no source in the data model, so the sheet's
 * columns G, H and I are left alone entirely — they are not on this type.
 */
export interface WaterStrikeRow {
	readonly holeId: string;
	readonly depthInMetres: number;
	readonly date: Date;
	/** Written as a bare integer, e.g. 900 or 1730 — the same convention as `ProgressRow`. */
	readonly timeHhmm: number;
	readonly casingDepthInMetres: number | null;
}

export interface WorkbookRows {
	readonly projectCode: string;
	readonly projectTitle: string;
	readonly projectClient: string;
	readonly projectLocation: string;
	readonly projectEngineer: string;
	readonly holes: readonly HoleRow[];
	readonly progress: readonly ProgressRow[];
	readonly spt: readonly SptRow[];
	readonly geology: readonly GeologyRow[];
	readonly samples: readonly SampleRow[];
	readonly core: readonly CoreRow[];
	readonly waterStrikes: readonly WaterStrikeRow[];
}
