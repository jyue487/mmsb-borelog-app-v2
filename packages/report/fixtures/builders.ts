/**
 * Fixture builders for the pagination snapshots.
 *
 * Synthetic rather than exported from a real borehole, because the cases that matter most
 * here — a zero-block borehole, a block landing just under the half-page retry threshold,
 * out-of-order depths — are precisely the ones real data rarely contains.
 *
 * Everything is stamped with a fixed date so snapshots are stable.
 */
import {
	DAY_START_AND_END_WORK_TYPE,
	createDefaultCoringBlock,
	createDefaultEndOfBoreholeBlock,
	createDefaultFallingHeadPermeabilityTestBlock,
	createDefaultLugeonTestBlock,
	createDefaultSptBlock,
	createDefaultUdBlock,
	type Block,
} from '@mmsb/core';

const EPOCH = new Date(0);

function stamp<T extends Block>(block: T, id: string, top: number, base: number): T {
	return { ...block, id, boreholeId: 'fixture-borehole', createdAt: EPOCH, updatedAt: null, topDepthInMetres: top, baseDepthInMetres: base };
}

/** Realistic blow counts so a rendered fixture shows the six SPT columns doing their job. */
export function spt(
	id: string,
	top: number,
	base: number,
	description = 'Firm to stiff light grey mottled brown silty CLAY with occasional fine sand',
	sptIndex = 1,
): Block {
	return {
		...stamp(createDefaultSptBlock(), id, top, base),
		description,
		sptIndex,
		disturbedSampleIndex: sptIndex,
		seatingIncBlows1: 12,
		seatingIncPen1: 75,
		seatingIncBlows2: 13,
		seatingIncPen2: 75,
		mainIncBlows1: 14,
		mainIncPen1: 75,
		mainIncBlows2: 15,
		mainIncPen2: 75,
		mainIncBlows3: 10,
		mainIncPen3: 75,
		mainIncBlows4: 11,
		mainIncPen4: 75,
		sptNValue: 50,
		totalMainPenetrationInMillimetres: 240,
		recoveryInPercentage: 87.5,
		dayWorkStatus: {
			...createDefaultSptBlock().dayWorkStatus,
			dayWorkStatusType: DAY_START_AND_END_WORK_TYPE,
			startDate: EPOCH,
			startTime: EPOCH,
			endDate: EPOCH,
			endTime: EPOCH,
			startWaterLevelInMetres: 1.25,
			endWaterLevelInMetres: 2.4,
		},
	};
}

export function ud(id: string, top: number, base: number, sampleIndex = 1): Block {
	return {
		...stamp(createDefaultUdBlock(), id, top, base),
		sampleIndex,
		soilDescription: 'Soft to firm dark grey slightly organic silty CLAY',
		recoveryInPercentage: 95,
	};
}

export function coring(id: string, top: number, base: number, rockSampleIndex = 1): Block {
	return {
		...stamp(createDefaultCoringBlock(), id, top, base),
		description: 'Moderately weathered, moderately strong, grey GRANITE, closely jointed',
		rockSampleIndex,
		coreRunInMetres: 1.5,
		coreRecoveryInPercentage: 92,
		rqdInPercentage: 45,
	};
}

export function fallingHead(id: string, top: number, base: number, index = 1): Block {
	return {
		...stamp(createDefaultFallingHeadPermeabilityTestBlock(), id, top, base),
		permeabilityTestIndex: index,
		description: 'Falling head permeability test, k = 3.2 x 10-6 m/s',
	};
}

export function lugeon(id: string, top: number, base: number, index = 1): Block {
	return {
		...stamp(createDefaultLugeonTestBlock(), id, top, base),
		lugeonTestIndex: index,
		description: 'Lugeon test, 4.2 Lu at 5 bar',
	};
}

export function endOfBorehole(id: string, top: number, base: number, remarks = ''): Block {
	return { ...stamp(createDefaultEndOfBoreholeBlock(), id, top, base), remarks };
}

/** A run of SPT blocks at a fixed interval, the commonest real shape. */
export function sptRun(count: number, startDepth: number, interval: number): Block[] {
	return Array.from({ length: count }, (_, i) =>
		spt(
			`spt-${i + 1}`,
			+(startDepth + i * interval).toFixed(1),
			+(startDepth + i * interval + interval * 0.6).toFixed(1),
			undefined,
			i + 1,
		),
	);
}

export const FIXTURES: Record<string, Block[]> = {
	// The case that threw before: generatePdfPages.ts:29 indexed blocks[length-1] unguarded.
	empty: [],

	'single-page': sptRun(6, 0, 1.5),

	'ten-page': sptRun(60, 0, 1.5),

	// A permeability test starting inside the SPT interval folds onto the SPT's row.
	'spt-fhpt-collapsed': [
		spt('spt-1', 0, 1.5),
		spt('spt-2', 1.5, 3.0),
		fallingHead('fhpt-1', 2.0, 2.8),
		spt('spt-3', 3.0, 4.5),
	],

	// The coring family renders three merged double-width cells instead of six singles.
	'coring-lugeon-collapsed': [
		coring('cor-1', 0, 3.0),
		lugeon('lug-1', 1.0, 2.5),
		coring('cor-2', 3.0, 6.0),
	],

	'ud-fhpt-collapsed': [ud('ud-1', 0, 2.0), fallingHead('fhpt-1', 0.5, 1.5), spt('spt-1', 2.0, 3.5)],

	// remarks.length / 30 drives the end-of-borehole height, then it stretches to fill the page.
	'eob-long-remarks': [
		...sptRun(3, 0, 1.5),
		endOfBorehole('eob-1', 4.5, 4.5, 'X'.repeat(300)),
	],

	'eob-no-remarks': [...sptRun(3, 0, 1.5), endOfBorehole('eob-1', 4.5, 4.5)],

	// A tall block starting late on the page: less than half fits, so it should be pushed to
	// the next page and the remainder padded.
	'pad-retry': [spt('spt-1', 0, 8.0), spt('spt-2', 8.0, 20.0), spt('spt-3', 20.0, 21.0)],

	// A gap between blocks is absorbed by the block above; a leading gap is padded.
	'leading-gap': [spt('spt-1', 2.0, 3.0), spt('spt-2', 5.0, 6.0)],

	/** One page exercising every interesting row shape, for visual comparison. */
	showcase: [
		spt('spt-1', 0, 0.45, undefined, 1),
		ud('ud-1', 1.5, 2.0),
		spt('spt-2', 3.0, 3.45, undefined, 2),
		fallingHead('fhpt-1', 3.2, 3.4),
		coring('cor-1', 4.5, 6.0),
		lugeon('lug-1', 5.0, 5.8),
		endOfBorehole('eob-1', 7.5, 7.5, 'Borehole terminated on client instruction after refusal in moderately weathered granite'),
	],

	// Out-of-order depths. The old loop looped unboundedly here.
	'negative-height': [spt('spt-1', 5.0, 6.0), spt('spt-2', 2.0, 3.0), spt('spt-3', 7.0, 8.0)],
};
