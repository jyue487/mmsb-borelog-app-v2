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

import type { CellContent } from '../model/table';
import { parseRichText, type RichToken } from '../text/richText';

/**
 * One table describing all 18 block types, replacing the 19 `render*BlockToHtml.ts` files.
 *
 * They were near-identical: every one emitted the same 14 cells in the same order and
 * differed only in which of them carried a value. Following the precedent already set on
 * web by `apps/web/src/components/blocks/blockGutterSpec.ts`, that variation becomes data.
 *
 * `Record<BlockTypeId, …>` is exhaustive, so a 19th block type is a compile error here —
 * the convention CLAUDE.md documents for keeping the parallel directories in step.
 */

/** A value over a rule over a second value; see CellContent's `divided`. */
export interface DividedValue {
	top: string;
	bottom: string;
}

export interface BlockRowSpec {
	/** Column 1 — sample / test identifier, e.g. `P3/D3`. */
	sampleLabels: (block: Block) => string[];
	/** Column 4. */
	description: (block: Block) => RichToken[];
	/** Columns 5-10: six single cells, or three double-width ones. */
	sptLayout: 'six' | 'mergedThree';
	/** Six entries when sptLayout is 'six'; omitted means six blanks. */
	sptCells?: (block: Block) => DividedValue[];
	/** Three entries when sptLayout is 'mergedThree'; omitted means three blanks. */
	mergedCells?: (block: Block) => string[];
	/** Column 11. */
	sptN?: (block: Block) => DividedValue;
	/** Column 12 (R/r). */
	recovery?: (block: Block) => string;
	/** End of borehole prints its installation date/time and its own water level instead. */
	usesDayWorkStatus: boolean;
}

// --- shared cell builders, ported rather than reinvented ---------------------------------

/**
 * Not every variant spells this the same way: UD, MZ and PS carry `soilDescription` while
 * the other fifteen carry `description`. The old renderers hid this by each reaching for
 * the field they happened to need; with one shared table it has to be explicit.
 */
export function blockDescription(block: Block): string {
	return 'description' in block ? block.description : block.soilDescription;
}

/** `renderDepthInfoToHtml.ts` verbatim: blank for -1, a single value when top === base. */
export function formatDepthInterval(topDepthInMetres: number, baseDepthInMetres: number): string {
	if (topDepthInMetres === -1 || baseDepthInMetres === -1) {
		return '';
	}
	if (topDepthInMetres === baseDepthInMetres) {
		return topDepthInMetres.toFixed(3);
	}
	return `${topDepthInMetres.toFixed(3)} - ${baseDepthInMetres.toFixed(3)}`;
}

/**
 * A sample number, or `*` when nothing was recovered.
 *
 * The recovery rule is read off the index rather than re-derived from a recovery field,
 * because the reindexer already applied it: it sets the index to -1 for a sample with no
 * recovery and does not advance that type's counter. Deciding it twice is what let the
 * PDF (`recoveryInPercentage === 0`) and the reindexer (`recoveryLengthInMillimetres === 0`)
 * disagree — the two differ when a nonzero length rounds to 0.0 % through the `.toFixed(1)`
 * in checkAndReturnSptBlock. docs/follow-ups.md item 5.
 */
function sampleNumber(index: number): string {
	return index < 0 ? '*' : String(index);
}

function plain(text: string): RichToken[] {
	return text === '' ? [] : [{ kind: 'text', text, italic: false, bold: false }];
}

/** In-situ tests are italicised — semantic, marking a measurement rather than a stratum. */
function italic(text: string): RichToken[] {
	return text === '' ? [] : [{ kind: 'text', text, italic: true, bold: false }];
}

const NO_VALUE: DividedValue = { top: '', bottom: '' };

/**
 * An SPT blow-count cell. The lower half shows the penetration only once the increment
 * has actually completed — 25 blows for a seating increment, 50 cumulative for the main
 * increment — which is the condition the old markup spelled out inline for each of the six
 * columns.
 */
function blowCell(blows: number | null, penetration: number | null, isComplete: boolean): DividedValue {
	return {
		top: blows === null ? '' : String(blows),
		bottom: isComplete && penetration !== null ? `${penetration}mm` : '',
	};
}

// --- the table ---------------------------------------------------------------------------

const DESCRIPTION_ONLY: Omit<BlockRowSpec, 'description'> = {
	sampleLabels: () => [],
	sptLayout: 'six',
	usesDayWorkStatus: true,
};

/** Standalone in-situ tests: symbol + index, italic description, nothing in the SPT columns. */
function testSpec(symbolOf: (block: Block) => string, indexOf: (block: Block) => number): BlockRowSpec {
	return {
		sampleLabels: (block) => [`${symbolOf(block)}${indexOf(block)}`],
		description: (block) => italic(blockDescription(block)),
		sptLayout: 'six',
		usesDayWorkStatus: true,
	};
}

/** Soil samples: symbol + index (or `*`), soil description, recovery in the R/r column. */
function soilSampleSpec(symbol: string): BlockRowSpec {
	return {
		sampleLabels: (block) => [
			`${symbol}${sampleNumber((block as { sampleIndex: number }).sampleIndex)}`,
		],
		description: (block) => plain(blockDescription(block)),
		sptLayout: 'six',
		recovery: (block) => (block as { recoveryInPercentage: number }).recoveryInPercentage.toFixed(1),
		usesDayWorkStatus: true,
	};
}

export const BLOCK_ROW_SPECS: Record<BlockTypeId, BlockRowSpec> = {
	[SPT_BLOCK_TYPE_ID]: {
		sampleLabels: (block) => {
			if (block.blockTypeId !== SPT_BLOCK_TYPE_ID) return [];
			return [`${SPT_SYMBOL}${block.sptIndex}/${DISTURBED_SAMPLE_SYMBOL}${sampleNumber(block.disturbedSampleIndex)}`];
		},
		description: (block) => plain(blockDescription(block)),
		sptLayout: 'six',
		sptCells: (block) => {
			if (block.blockTypeId !== SPT_BLOCK_TYPE_ID) return [NO_VALUE, NO_VALUE, NO_VALUE, NO_VALUE, NO_VALUE, NO_VALUE];
			const s1 = block.seatingIncBlows1;
			const s2 = block.seatingIncBlows2;
			const m1 = block.mainIncBlows1;
			const m2 = block.mainIncBlows2;
			const m3 = block.mainIncBlows3;
			const m4 = block.mainIncBlows4;
			return [
				blowCell(s1, block.seatingIncPen1, s1 === 25),
				blowCell(s2, block.seatingIncPen2, s2 !== null && s1 + s2 === 25),
				blowCell(m1, block.mainIncPen1, m1 === 50),
				blowCell(m2, block.mainIncPen2, m2 !== null && m1 + m2 === 50),
				blowCell(m3, block.mainIncPen3, m2 !== null && m3 !== null && m1 + m2 + m3 === 50),
				blowCell(m4, block.mainIncPen4, m2 !== null && m3 !== null && m4 !== null && m1 + m2 + m3 + m4 === 50),
			];
		},
		sptN: (block) => {
			if (block.blockTypeId !== SPT_BLOCK_TYPE_ID) return NO_VALUE;
			return {
				top: String(block.sptNValue),
				bottom: block.sptNValue === 50 ? `${block.totalMainPenetrationInMillimetres}mm` : '',
			};
		},
		recovery: (block) => (block as { recoveryInPercentage: number }).recoveryInPercentage.toFixed(1),
		usesDayWorkStatus: true,
	},

	[CORING_BLOCK_TYPE_ID]: {
		sampleLabels: (block) => {
			if (block.blockTypeId !== CORING_BLOCK_TYPE_ID) return [];
			return [`${CORING_SYMBOL}${sampleNumber(block.rockSampleIndex)}`];
		},
		description: (block) => plain(blockDescription(block)),
		sptLayout: 'mergedThree',
		mergedCells: (block) => {
			if (block.blockTypeId !== CORING_BLOCK_TYPE_ID) return ['', '', ''];
			return [String(block.coreRunInMetres), String(block.coreRecoveryInPercentage), String(block.rqdInPercentage)];
		},
		usesDayWorkStatus: true,
	},

	// Cavity and Lugeon share coring's merged column geometry but print nothing in it.
	[CAVITY_BLOCK_TYPE_ID]: {
		sampleLabels: () => [],
		description: (block) => plain(blockDescription(block)),
		sptLayout: 'mergedThree',
		usesDayWorkStatus: true,
	},
	[LUGEON_TEST_BLOCK_TYPE_ID]: {
		sampleLabels: (block) =>
			block.blockTypeId === LUGEON_TEST_BLOCK_TYPE_ID ? [`${block.symbol}${block.lugeonTestIndex}`] : [],
		description: (block) => italic(blockDescription(block)),
		sptLayout: 'mergedThree',
		usesDayWorkStatus: true,
	},

	[UD_BLOCK_TYPE_ID]: soilSampleSpec(UD_SYMBOL),
	[MZ_BLOCK_TYPE_ID]: soilSampleSpec(MZ_SYMBOL),
	[PS_BLOCK_TYPE_ID]: soilSampleSpec(PS_SYMBOL),

	// Hand auger carries no recovery column.
	[HA_BLOCK_TYPE_ID]: {
		sampleLabels: (block) =>
			block.blockTypeId === HA_BLOCK_TYPE_ID ? [`${HA_SYMBOL}${block.haSampleIndex}`] : [],
		description: (block) => plain(blockDescription(block)),
		sptLayout: 'six',
		usesDayWorkStatus: true,
	},

	[FALLING_HEAD_PERMEABILITY_TEST_BLOCK_TYPE_ID]: testSpec(
		(block) => (block as { symbol: string }).symbol,
		(block) => (block as { permeabilityTestIndex: number }).permeabilityTestIndex,
	),
	[RISING_HEAD_PERMEABILITY_TEST_BLOCK_TYPE_ID]: testSpec(
		(block) => (block as { symbol: string }).symbol,
		(block) => (block as { permeabilityTestIndex: number }).permeabilityTestIndex,
	),
	[CONSTANT_HEAD_PERMEABILITY_TEST_BLOCK_TYPE_ID]: testSpec(
		(block) => (block as { symbol: string }).symbol,
		(block) => (block as { permeabilityTestIndex: number }).permeabilityTestIndex,
	),
	[VANE_SHEAR_TEST_BLOCK_TYPE_ID]: testSpec(
		(block) => (block as { symbol: string }).symbol,
		(block) => (block as { vaneShearTestIndex: number }).vaneShearTestIndex,
	),
	[PRESSUREMETER_TEST_BLOCK_TYPE_ID]: testSpec(
		(block) => (block as { symbol: string }).symbol,
		(block) => (block as { pressuremeterTestIndex: number }).pressuremeterTestIndex,
	),

	[WASH_BORING_BLOCK_TYPE_ID]: { ...DESCRIPTION_ONLY, description: (block) => plain(blockDescription(block)) },
	[CONCRETE_SLAB_BLOCK_TYPE_ID]: { ...DESCRIPTION_ONLY, description: (block) => plain(blockDescription(block)) },
	[ASPHALT_BLOCK_TYPE_ID]: { ...DESCRIPTION_ONLY, description: (block) => plain(blockDescription(block)) },
	[CUSTOM_BLOCK_TYPE_ID]: { ...DESCRIPTION_ONLY, description: (block) => plain(blockDescription(block)) },

	[END_OF_BOREHOLE_BLOCK_TYPE_ID]: {
		sampleLabels: () => [],
		description: (block) => {
			if (block.blockTypeId !== END_OF_BOREHOLE_BLOCK_TYPE_ID) return [];
			const remarks = block.remarks.length === 0 ? '' : `<br><br>Remarks: ${block.remarks}.`;
			return parseRichText(blockDescription(block) + remarks);
		},
		sptLayout: 'six',
		usesDayWorkStatus: false,
	},
};

/**
 * The DEPTH column (2). Kept out of the spec table because every type builds it the same
 * way — from the block's own interval, plus the folded test's interval when there is one.
 */
export function depthLabels(block: Block, testBlock: Block | null): string[] {
	const labels = [formatDepthInterval(block.topDepthInMetres, block.baseDepthInMetres)];
	if (testBlock !== null) {
		labels.push(formatDepthInterval(testBlock.topDepthInMetres, testBlock.baseDepthInMetres));
	}
	return labels.filter((label) => label !== '');
}

/**
 * The SAMPLING column (1), including a folded test's own symbol on a second line.
 */
export function sampleLabels(block: Block, testBlock: Block | null): string[] {
	const labels = [...BLOCK_ROW_SPECS[block.blockTypeId].sampleLabels(block)];
	if (testBlock !== null) {
		const testSymbol = (testBlock as { symbol?: string }).symbol;
		const testIndex =
			(testBlock as { permeabilityTestIndex?: number }).permeabilityTestIndex ??
			(testBlock as { lugeonTestIndex?: number }).lugeonTestIndex;
		if (testSymbol !== undefined && testIndex !== undefined) {
			labels.push(`${testSymbol}${testIndex}`);
		}
	}
	return labels;
}

/**
 * The DESCRIPTION column (4). A folded test's description is appended in italics after a
 * line break, which is what the SPT/UD/Coring renderers did by string concatenation.
 */
export function descriptionTokens(block: Block, testBlock: Block | null): RichToken[] {
	const tokens = [...BLOCK_ROW_SPECS[block.blockTypeId].description(block)];
	if (testBlock !== null) {
		tokens.push({ kind: 'break' });
		tokens.push({ kind: 'text', text: blockDescription(testBlock), italic: true, bold: false });
	}
	return tokens;
}

export function contentFromDivided(value: DividedValue): CellContent {
	if (value.top === '' && value.bottom === '') {
		return { kind: 'empty' };
	}
	return { kind: 'divided', top: value.top, bottom: value.bottom };
}
