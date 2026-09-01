/**
 * A fixture shaped after a real workbook: `MMSB Borehole AGS - CBH-S13-P08.xlsx`.
 *
 * Deliberately modelled on a specific human-filled log rather than invented, so the
 * exporter's output can be compared against a file the report is known to render. It
 * exercises the cases the mapping actually has to get right: hand-auger intervals with and
 * without a sample, an SPT whose sample base is top-plus-penetration rather than the block
 * base, an undisturbed sample, coring, soil *and* rock legend codes, a multi-day shift
 * pattern that the Progress sheet turns into two rows per day, in-situ tests sitting inside
 * a host block's interval, and a `NIL` water level that the Water Strike sheet skips.
 */
import {
	DAY_CONTINUE_WORK_TYPE,
	DAY_END_WORK_TYPE,
	DAY_START_WORK_TYPE,
	WL_NIL,
	createDefaultCoringBlock,
	createDefaultEndOfBoreholeBlock,
	createDefaultFallingHeadPermeabilityTestBlock,
	createDefaultHaBlock,
	createDefaultLugeonTestBlock,
	createDefaultSptBlock,
	createDefaultUdBlock,
	type Block,
	type Borehole,
	type DayWorkStatus,
	type DayWorkStatusType,
	type WaterLevelInMetres,
} from '@mmsb/core';

const DAY_ONE = new Date(2026, 0, 15);
const DAY_TWO = new Date(2026, 0, 16);
const AT_0900 = new Date(2026, 0, 15, 9, 0);
const AT_1730 = new Date(2026, 0, 15, 17, 30);

function shift(
	type: DayWorkStatusType,
	startDate: Date,
	endDate: Date,
	water: WaterLevelInMetres,
	casing: number | null,
): DayWorkStatus {
	return {
		dayWorkStatusType: type,
		startDate,
		startTime: AT_0900,
		startWaterLevelInMetres: water,
		startCasingDepthInMetres: casing,
		endDate,
		endTime: AT_1730,
		endWaterLevelInMetres: water,
		endCasingDepthInMetres: casing,
	};
}

const CONTINUE_DAY_ONE = shift(DAY_CONTINUE_WORK_TYPE, DAY_ONE, DAY_ONE, 0.8, 16.5);
const CONTINUE_DAY_TWO = shift(DAY_CONTINUE_WORK_TYPE, DAY_TWO, DAY_TWO, 2.7, 37.5);

function stamp<T extends Block>(block: T, id: string, top: number, base: number): T {
	return {
		...block,
		id,
		boreholeId: 'fixture-borehole',
		createdAt: DAY_ONE,
		updatedAt: null,
		topDepthInMetres: top,
		baseDepthInMetres: base,
	};
}

function ha(
	id: string,
	top: number,
	base: number,
	haSampleIndex: number,
	description: string,
	soilCode: number | null,
	requireSample: boolean,
): Block {
	const block = createDefaultHaBlock();
	return {
		...stamp(block, id, top, base),
		haSampleIndex,
		description,
		requireSample,
		soilProperties: { ...block.soilProperties, soilCode },
		dayWorkStatus: CONTINUE_DAY_ONE,
	};
}

/** `blows` is [seating1, seating2, main1..main4]; every increment is the standard 75 mm. */
function spt(
	id: string,
	top: number,
	index: number,
	description: string,
	soilCode: number | null,
	blows: readonly [number, number, number, number, number, number],
	dayWorkStatus: DayWorkStatus = CONTINUE_DAY_ONE,
): Block {
	const block = createDefaultSptBlock();
	const mainTotal = blows[2] + blows[3] + blows[4] + blows[5];
	return {
		...stamp(block, id, top, top + 1.5),
		sptIndex: index,
		disturbedSampleIndex: index,
		description,
		seatingIncBlows1: blows[0],
		seatingIncPen1: 75,
		seatingIncBlows2: blows[1],
		seatingIncPen2: 75,
		mainIncBlows1: blows[2],
		mainIncPen1: 75,
		mainIncBlows2: blows[3],
		mainIncPen2: 75,
		mainIncBlows3: blows[4],
		mainIncPen3: 75,
		mainIncBlows4: blows[5],
		mainIncPen4: 75,
		sptNValue: mainTotal,
		totalMainPenetrationInMillimetres: 300,
		recoveryInPercentage: 62.222222222222222,
		soilProperties: { ...block.soilProperties, soilCode },
		dayWorkStatus,
	};
}

function ud(id: string, top: number, sampleIndex: number, soilCode: number | null): Block {
	const block = createDefaultUdBlock();
	return {
		...stamp(block, id, top, top + 1.5),
		sampleIndex,
		soilDescription: 'Top and Bottom: Light grey, brown Very Clayey SAND of Intermediate Plasticity',
		recoveryInPercentage: 90,
		// The sample reaches 1.0 m into the 1.5 m interval, so its base is 10.0 while the
		// stratum it came from runs 9.0-10.5.
		penetrationDepthInMetres: 1,
		recoveryLengthInMetres: 0.9,
		topSoilProperties: { ...block.topSoilProperties, soilCode },
		dayWorkStatus: CONTINUE_DAY_TWO,
	};
}

function coring(
	id: string,
	top: number,
	rockSampleIndex: number,
	description: string,
	rockCode: number | null,
	rqdInPercentage: number,
	dayWorkStatus: DayWorkStatus = CONTINUE_DAY_TWO,
): Block {
	const block = createDefaultCoringBlock();
	return {
		...stamp(block, id, top, top + 1.5),
		rockSampleIndex,
		description,
		coreRunInMetres: 1.5,
		coreRecoveryInPercentage: 100,
		rqdInPercentage,
		rockProperties: { ...block.rockProperties, rockCode },
		dayWorkStatus,
	};
}

export const FIXTURE_BOREHOLE: Borehole = {
	id: 'fixture-borehole',
	projectId: 'fixture-project',
	name: 'CBH-S13-P8',
	typeOfBoring: 'Rotary Core',
	typeOfRig: 'Hydraulic',
	diameterOfBoring: '100mm',
	eastingInMetres: null,
	northingInMetres: null,
	reducedLevelInMetres: null,
	drillerName: 'Bharat',
	verifierName: '',
	verifierSignatureBase64: '',
	verifierSignDate: null,
};

export const FIXTURE_BLOCKS: Block[] = [
	// Hand auger. The first interval was augered but not sampled — a geology row with no
	// matching sample row, exactly as in the real workbook.
	{
		...ha('ha-0', 0, 1, 0, '', null, false),
		// `NIL`, not a depth: the hole was dry. Progress leaves column G blank and the Water
		// Strike sheet skips the entry entirely.
		dayWorkStatus: shift(DAY_START_WORK_TYPE, DAY_ONE, DAY_ONE, WL_NIL, null),
	},
	ha('ha-1', 1, 2, 1, 'Light grey sandy SILT (Hand Auger)', 303, true),
	ha('ha-2', 2, 3, 2, 'Light brown silty SAND (Hand Auger)', 403, true),

	spt('spt-1', 3, 1, 'Loose, light grey Silty/Clayey SAND', 403, [1, 0, 1, 2, 1, 2]),
	spt('spt-2', 4.5, 2, 'Loose, light grey SAND', 401, [1, 2, 1, 2, 2, 2]),
	// Starts inside spt-2's 4.5-6.0 interval: the PDF folds it onto the SPT's own row, while
	// Geology gives it a row of its own that overlaps the one above it.
	{
		...stamp(createDefaultFallingHeadPermeabilityTestBlock(), 'fhpt-1', 5, 5.5),
		permeabilityTestIndex: 1,
		dayWorkStatus: CONTINUE_DAY_ONE,
	},
	spt('spt-3', 6, 3, 'Loose, light grey Very Clayey SAND', 402, [1, 2, 2, 2, 2, 3]),
	// Refusal: 50 main-drive blows switches the reported result to the form that also
	// states how far the sampler got.
	{
		...spt('spt-4', 7.5, 4, 'Stiff, light grey sandy SILT', 303, [1, 2, 20, 20, 5, 5]),
		dayWorkStatus: shift(DAY_END_WORK_TYPE, DAY_ONE, DAY_ONE, 0.8, 16.5),
	},

	// Day two opens here, so the Progress sheet gets its own start row.
	{
		...ud('ud-1', 9, 1, 402),
		dayWorkStatus: shift(DAY_START_WORK_TYPE, DAY_TWO, DAY_TWO, 1, 16.5),
	},

	coring('core-1', 39, 1, 'Light grey, fresh excellent GRANITE', 810, 90),
	coring('core-2', 40.5, 2, 'Light grey, slightly weathered to fresh good GRANITE', 810, 78),
	// The other index field name, and the other host type — a Lugeon test inside a core run.
	{
		...stamp(createDefaultLugeonTestBlock(), 'lt-1', 41, 41.5),
		lugeonTestIndex: 1,
		dayWorkStatus: CONTINUE_DAY_TWO,
	},
	{
		...coring('core-3', 42, 3, 'Light grey, slightly weathered fair GRANITE', 810, 71.333333333333),
		dayWorkStatus: shift(DAY_END_WORK_TYPE, DAY_TWO, DAY_TWO, 2.7, 43.5),
	},

	{
		...stamp(createDefaultEndOfBoreholeBlock(), 'eob', 43.5, 43.5),
		remarks: 'Back filled with cement grout.',
		dayWorkStatus: CONTINUE_DAY_TWO,
	},
];
