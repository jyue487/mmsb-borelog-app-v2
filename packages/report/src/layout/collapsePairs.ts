import {
	CONSTANT_HEAD_PERMEABILITY_TEST_BLOCK_TYPE_ID,
	CORING_BLOCK_TYPE_ID,
	FALLING_HEAD_PERMEABILITY_TEST_BLOCK_TYPE_ID,
	LUGEON_TEST_BLOCK_TYPE_ID,
	RISING_HEAD_PERMEABILITY_TEST_BLOCK_TYPE_ID,
	SPT_BLOCK_TYPE_ID,
	UD_BLOCK_TYPE_ID,
	type Block,
	type BlockTypeId,
} from '@mmsb/core';

/**
 * An in-situ test that starts inside the interval of the sample above it is printed on the
 * sample's own row rather than a row of its own — a permeability test inside an SPT, or a
 * Lugeon test inside a coring run.
 *
 * The old renderer expressed this as three near-verbatim 22-line functions
 * (`checkAndReturnSptSpecialCaseResult` / `…Ud…` / `…Coring…`,
 * `apps/mobile/src/utils/pdf/generatePdfPages.ts:32-99`) that differed only in the host
 * type and the set of followers they accepted.
 */
const PERMEABILITY_TESTS = [
	FALLING_HEAD_PERMEABILITY_TEST_BLOCK_TYPE_ID,
	RISING_HEAD_PERMEABILITY_TEST_BLOCK_TYPE_ID,
	CONSTANT_HEAD_PERMEABILITY_TEST_BLOCK_TYPE_ID,
] as const;

const COLLAPSIBLE: readonly { host: BlockTypeId; followers: readonly BlockTypeId[] }[] = [
	{ host: SPT_BLOCK_TYPE_ID, followers: PERMEABILITY_TESTS },
	{ host: UD_BLOCK_TYPE_ID, followers: PERMEABILITY_TESTS },
	{ host: CORING_BLOCK_TYPE_ID, followers: [LUGEON_TEST_BLOCK_TYPE_ID] },
];

/**
 * The block that should be folded into `block`'s row, or null if there is none.
 *
 * `next.topDepthInMetres < block.baseDepthInMetres` is the containment test, preserved
 * exactly: it compares the follower's top against the host's own base, not against the
 * next row's top, so a test starting exactly at the host's base is NOT folded in.
 */
export function collapsibleFollower(block: Block, next: Block | null): Block | null {
	if (next === null) {
		return null;
	}
	if (next.topDepthInMetres >= block.baseDepthInMetres) {
		return null;
	}
	const rule = COLLAPSIBLE.find((candidate) => candidate.host === block.blockTypeId);
	if (rule === undefined) {
		return null;
	}
	return rule.followers.includes(next.blockTypeId) ? next : null;
}
