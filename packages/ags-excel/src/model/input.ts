import type { Block, Borehole } from '@mmsb/core';

/**
 * Project header fields, as the AGS workbook's Project sheet wants them.
 *
 * Deliberately not `ReportProject` from `@mmsb/report`: that type has no `code`, and the
 * project code is what every other sheet's `PROJ_ID` column keys off.
 */
export interface AgsProject {
	readonly code: string;
	readonly title: string;
	readonly location: string;
	readonly client: string;
	readonly consultant: string;
}

export interface AgsBorehole {
	readonly borehole: Borehole;
	readonly blocks: readonly Block[];
}

/**
 * Everything one exported workbook contains.
 *
 * `boreholes` is a list because the template is project-shaped — one PROJ row, then every
 * other sheet keyed by `HOLE_ID`. A single-borehole export is this with a list of one, which
 * is why the per-borehole and per-project buttons are one feature rather than two.
 */
export interface AgsExcelInput {
	readonly project: AgsProject;
	readonly boreholes: readonly AgsBorehole[];
}
