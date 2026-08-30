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

/**
 * Carried forward from `renderFooterToHtml.ts:21`, where it is a bare literal.
 *
 * There is no field on `Project` or `Borehole` to hold it. Adding one is a full vertical
 * slice — both interface copies, the borehole form, the serializer *and* deserializer under
 * `src/json/**`, a Supabase column, and a migration — which is its own project, so the
 * literal moves across unchanged and the debt stays localised to this one line.
 */
export const LOGGED_BY_NAME = 'IZWAN';
