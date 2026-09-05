import type { Block, Borehole } from '@mmsb/core';

/**
 * Only the project fields the header actually prints.
 *
 * Deliberately NOT `@mmsb/core`'s `Project`: core's copy carries `terminationCriteria` and
 * mobile's hand-synced copy does not (see the note at the top of
 * `apps/mobile/src/interfaces/Project.ts` for why mobile must not gain it). Requiring the
 * full type here would make the mobile call site a compile error, and this narrower shape
 * is structurally satisfied by both copies — which is what lets the interface de-duplication
 * stay a separate project instead of a prerequisite.
 */
export interface ReportProject {
	title: string;
	location: string;
	client: string;
	consultant: string;
}

export interface ReportInput {
	project: ReportProject;
	borehole: Borehole;
	blocks: Block[];
}
