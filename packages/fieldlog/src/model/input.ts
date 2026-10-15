import type { Block, Borehole, MainDriveRefusalBlows } from '@mmsb/core';

/**
 * Only the project fields the report reads: the ones the header prints, plus the code.
 *
 * Deliberately NOT `@mmsb/core`'s `Project`: core's copy carries `terminationCriteria` and
 * mobile's hand-synced copy does not (see the note at the top of
 * `apps/mobile/src/interfaces/Project.ts` for why mobile must not gain it). Requiring the
 * full type here would make the mobile call site a compile error, and this narrower shape
 * is structurally satisfied by both copies — which is what lets the interface de-duplication
 * stay a separate project instead of a prerequisite.
 */
export interface ReportProject {
	/** Not printed — the hosts name the file after it, and the AGS export keys on it. */
	code: string;
	title: string;
	location: string;
	client: string;
	consultant: string;
	/** Not printed — the SPT main-drive refusal limit (`projects.spt_n_max`), 50 or 100. */
	sptNMax: MainDriveRefusalBlows;
}

export interface ReportInput {
	project: ReportProject;
	borehole: Borehole;
	blocks: Block[];
}
