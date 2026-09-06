import {
	ASPHALT_BLOCK_TYPE_ID,
	CAVITY_BLOCK_TYPE_ID,
	CONCRETE_SLAB_BLOCK_TYPE_ID,
	CONSTANT_HEAD_PERMEABILITY_TEST_BLOCK_TYPE_ID,
	CORING_BLOCK_TYPE_ID,
	CORING_SYMBOL,
	CUSTOM_BLOCK_TYPE_ID,
	DISTURBED_SAMPLE_SYMBOL,
	END_OF_BOREHOLE_BLOCK_TYPE_ID,
	FALLING_HEAD_PERMEABILITY_TEST_BLOCK_TYPE_ID,
	HA_BLOCK_TYPE_ID,
	HA_SYMBOL,
	LUGEON_TEST_BLOCK_TYPE_ID,
	MZ_BLOCK_TYPE_ID,
	MZ_SYMBOL,
	PRESSUREMETER_TEST_BLOCK_TYPE_ID,
	PS_BLOCK_TYPE_ID,
	PS_SYMBOL,
	RISING_HEAD_PERMEABILITY_TEST_BLOCK_TYPE_ID,
	SPT_BLOCK_TYPE_ID,
	SPT_SYMBOL,
	UD_BLOCK_TYPE_ID,
	UD_SYMBOL,
	VANE_SHEAR_TEST_BLOCK_TYPE_ID,
	WASH_BORING_BLOCK_TYPE_ID,
	type Block,
	type BlockTypeId,
} from '@mmsb/core';

/**
 * Per-block-type facts the AGS sheets need, as exhaustive `Record<BlockTypeId, …>` tables.
 *
 * Same convention as `BLOCK_ROW_SPECS` in `@mmsb/report`: a 19th block type becomes a
 * compile error here rather than a silently missing row.
 */

/**
 * Whether a block earns a row on `Geology - AGS`.
 *
 * The six in-situ tests are not strata — they are performed *within* another block's
 * interval, and the PDF folds them onto the host's own row (`collapsePairs.ts`). They still
 * get a row here, because `GEOL_DESC` is where the consumer reads the description column
 * from, and a log that omits "Falling Head Permeability Test" is missing information a
 * human put there. The cost is paid in `buildGeologyRows`, which chains every row's base to
 * the next row's top: a test truncates the stratum it sits inside, so that stratum's row is
 * shorter than the interval its description was written for. See `docs/follow-ups.md`.
 *
 * End of borehole is a terminator, not a layer, and stays out.
 */
export const CONTRIBUTES_STRATUM: Record<BlockTypeId, boolean> = {
	[SPT_BLOCK_TYPE_ID]: true,
	[CORING_BLOCK_TYPE_ID]: true,
	[CAVITY_BLOCK_TYPE_ID]: true,
	[UD_BLOCK_TYPE_ID]: true,
	[MZ_BLOCK_TYPE_ID]: true,
	[PS_BLOCK_TYPE_ID]: true,
	[HA_BLOCK_TYPE_ID]: true,
	[WASH_BORING_BLOCK_TYPE_ID]: true,
	[CONCRETE_SLAB_BLOCK_TYPE_ID]: true,
	[ASPHALT_BLOCK_TYPE_ID]: true,
	[CUSTOM_BLOCK_TYPE_ID]: true,
	[END_OF_BOREHOLE_BLOCK_TYPE_ID]: false,
	[VANE_SHEAR_TEST_BLOCK_TYPE_ID]: true,
	[FALLING_HEAD_PERMEABILITY_TEST_BLOCK_TYPE_ID]: true,
	[RISING_HEAD_PERMEABILITY_TEST_BLOCK_TYPE_ID]: true,
	[CONSTANT_HEAD_PERMEABILITY_TEST_BLOCK_TYPE_ID]: true,
	[LUGEON_TEST_BLOCK_TYPE_ID]: true,
	[PRESSUREMETER_TEST_BLOCK_TYPE_ID]: true,
};

/** `<i>` in a description marks an in-situ test for the PDF; the spreadsheet wants plain text. */
export function plainDescription(text: string): string {
	return text.replace(/<\/?i>/g, '').trim();
}

/** The stratum description, and the legend code that selects its hatch image. */
export function stratumOf(block: Block): { description: string; legendCode: number | null } {
	switch (block.blockTypeId) {
		case SPT_BLOCK_TYPE_ID:
		case HA_BLOCK_TYPE_ID:
			return {
				description: plainDescription(block.description),
				legendCode: block.soilProperties.soilCode,
			};
		case CORING_BLOCK_TYPE_ID:
			return {
				description: plainDescription(block.description),
				legendCode: block.rockProperties.rockCode,
			};
		case UD_BLOCK_TYPE_ID:
		case MZ_BLOCK_TYPE_ID:
		case PS_BLOCK_TYPE_ID:
			// These carry `soilDescription`, not `description`, and two sets of soil
			// properties. The top one describes the stratum the sample was taken from.
			return {
				description: plainDescription(block.soilDescription),
				legendCode: block.topSoilProperties.soilCode,
			};
		default:
			// Cavity, wash boring, concrete slab, asphalt, custom: a real interval with a
			// description but no soil or rock properties, so no legend code to give.
			return { description: plainDescription(block.description), legendCode: null };
	}
}

/**
 * How deep the hole had been drilled once this block was finished.
 *
 * Not simply `baseDepthInMetres`: the Progress sheet in a real workbook records 16.95 m at
 * the end of a day whose last block was an SPT starting at 16.5 m — the *sampler's* reach,
 * top plus penetration, rather than the nominal 1.5 m interval.
 */
export function drilledDepthOf(block: Block): number {
	switch (block.blockTypeId) {
		case SPT_BLOCK_TYPE_ID:
			return block.topDepthInMetres + totalPenetrationMm(block) / 1000;
		case UD_BLOCK_TYPE_ID:
		case MZ_BLOCK_TYPE_ID:
		case PS_BLOCK_TYPE_ID:
			return block.topDepthInMetres + block.penetrationDepthInMetres;
		default:
			return block.baseDepthInMetres;
	}
}

export function totalPenetrationMm(block: Extract<Block, { blockTypeId: typeof SPT_BLOCK_TYPE_ID }>): number {
	return (
		block.seatingIncPen1 +
		(block.seatingIncPen2 ?? 0) +
		block.mainIncPen1 +
		(block.mainIncPen2 ?? 0) +
		(block.mainIncPen3 ?? 0) +
		(block.mainIncPen4 ?? 0)
	);
}

export interface SampleFacts {
	/** `SAMP_TYPE`. Null for hand-auger samples, which real workbooks leave blank. */
	readonly sampleType: string | null;
	readonly sampleReference: string;
	readonly baseDepthInMetres: number;
	readonly recoveryFraction: number | null;
}

/**
 * The sample a block yields, or null if it yields none.
 *
 * Codes and reference formats are taken from real workbooks: an SPT at 3.0 m appears as
 * type `D`, reference `D1/P1`, spanning 3.0–3.45. Note the reference puts the disturbed
 * sample first, the reverse of the `P3/D3` label the PDF prints.
 *
 * A negative sample index means the reindexer withheld a number because nothing was
 * recovered — the PDF prints `*` there. Nothing recovered is no sample, so those take
 * the null path rather than minting a reference: `D-1/P3` is not a reference any human
 * would write, and a second no-recovery sample in the same hole would repeat it.
 */
export function sampleOf(block: Block): SampleFacts | null {
	switch (block.blockTypeId) {
		case SPT_BLOCK_TYPE_ID:
			if (block.disturbedSampleIndex < 0) {
				return null;
			}
			return {
				sampleType: DISTURBED_SAMPLE_SYMBOL,
				sampleReference: `${DISTURBED_SAMPLE_SYMBOL}${block.disturbedSampleIndex}/${SPT_SYMBOL}${block.sptIndex}`,
				baseDepthInMetres: drilledDepthOf(block),
				recoveryFraction: block.recoveryInPercentage / 100,
			};
		case UD_BLOCK_TYPE_ID:
		case MZ_BLOCK_TYPE_ID:
		case PS_BLOCK_TYPE_ID: {
			if (block.sampleIndex < 0) {
				return null;
			}
			const symbol =
				block.blockTypeId === UD_BLOCK_TYPE_ID
					? UD_SYMBOL
					: block.blockTypeId === MZ_BLOCK_TYPE_ID
						? MZ_SYMBOL
						: PS_SYMBOL;
			return {
				// All three are undisturbed samples, so they share the AGS `U` type code.
				sampleType: 'U',
				sampleReference: `${symbol}${block.sampleIndex}`,
				baseDepthInMetres: drilledDepthOf(block),
				recoveryFraction: block.recoveryInPercentage / 100,
			};
		}
		case CORING_BLOCK_TYPE_ID:
			if (block.rockSampleIndex < 0) {
				return null;
			}
			return {
				sampleType: CORING_SYMBOL,
				sampleReference: `${CORING_SYMBOL}${block.rockSampleIndex}`,
				baseDepthInMetres: block.baseDepthInMetres,
				// Core recovery is reported on the Core sheet as TCR, and left blank here —
				// as it is in every real workbook.
				recoveryFraction: null,
			};
		case HA_BLOCK_TYPE_ID:
			// A hand-auger interval only yields a sample when one was actually taken; the
			// fixture's 0–1 m interval has a geology row but no sample row.
			if (!block.requireSample) {
				return null;
			}
			return {
				sampleType: null,
				sampleReference: `${HA_SYMBOL}${block.haSampleIndex}`,
				// The recovered length is not in the data model — a real workbook has a human's
				// 1.0–1.3 m where we can only say which interval it came from.
				baseDepthInMetres: block.baseDepthInMetres,
				recoveryFraction: null,
			};
		case VANE_SHEAR_TEST_BLOCK_TYPE_ID:
			return insituTest(block.symbol, block.vaneShearTestIndex, block.baseDepthInMetres);
		case FALLING_HEAD_PERMEABILITY_TEST_BLOCK_TYPE_ID:
		case RISING_HEAD_PERMEABILITY_TEST_BLOCK_TYPE_ID:
		case CONSTANT_HEAD_PERMEABILITY_TEST_BLOCK_TYPE_ID:
			// All three carry the index under the same name; only the symbol differs.
			return insituTest(block.symbol, block.permeabilityTestIndex, block.baseDepthInMetres);
		case LUGEON_TEST_BLOCK_TYPE_ID:
			return insituTest(block.symbol, block.lugeonTestIndex, block.baseDepthInMetres);
		case PRESSUREMETER_TEST_BLOCK_TYPE_ID:
			return insituTest(block.symbol, block.pressuremeterTestIndex, block.baseDepthInMetres);
		default:
			return null;
	}
}

/**
 * An in-situ test's entry on `Samples - AGS`.
 *
 * A test is not a sample, and AGS has no `SAMP_TYPE` code for one — but this sheet is where
 * the consumer reads the labels it draws in the log's sample column, so the test belongs
 * here for the same reason the PDF prints `FHPT1` in that column
 * (`packages/report/src/rows/blockRowSpec.ts`). Type is left blank, as it is for hand-auger
 * samples, and there is nothing to report as recovery.
 */
function insituTest(symbol: string, index: number, baseDepthInMetres: number): SampleFacts {
	return {
		sampleType: null,
		sampleReference: `${symbol}${index}`,
		baseDepthInMetres,
		recoveryFraction: null,
	};
}
