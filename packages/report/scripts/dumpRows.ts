/**
 * Builds a body row for every one of the 18 block types and prints its cells.
 *
 *   pnpm --filter @mmsb/report rows
 *
 * Two things are being checked. First, that each type puts its values in the columns the
 * old renderer put them in — that is what the printed table shows. Second, and enforced
 * rather than eyeballed, that every row tiles all 14 columns exactly once: the old code
 * held that invariant only by convention, and a miscount there silently shifts a block
 * type's values into the wrong column.
 */
import {
	ASPHALT_BLOCK_TYPE_ID,
	BLOCK_TYPE_ID_LIST,
	CAVITY_BLOCK_TYPE_ID,
	CONCRETE_SLAB_BLOCK_TYPE_ID,
	CONSTANT_HEAD_PERMEABILITY_TEST_BLOCK_TYPE_ID,
	CORING_BLOCK_TYPE_ID,
	CUSTOM_BLOCK_TYPE_ID,
	DAY_START_AND_END_WORK_TYPE,
	END_OF_BOREHOLE_BLOCK_TYPE_ID,
	FALLING_HEAD_PERMEABILITY_TEST_BLOCK_TYPE_ID,
	HA_BLOCK_TYPE_ID,
	LUGEON_TEST_BLOCK_TYPE_ID,
	MZ_BLOCK_TYPE_ID,
	PRESSUREMETER_TEST_BLOCK_TYPE_ID,
	PS_BLOCK_TYPE_ID,
	RISING_HEAD_PERMEABILITY_TEST_BLOCK_TYPE_ID,
	SPT_BLOCK_TYPE_ID,
	UD_BLOCK_TYPE_ID,
	VANE_SHEAR_TEST_BLOCK_TYPE_ID,
	WASH_BORING_BLOCK_TYPE_ID,
	createDefaultAsphaltBlock,
	createDefaultCavityBlock,
	createDefaultConcreteSlabBlock,
	createDefaultConstantHeadPermeabilityTestBlock,
	createDefaultCoringBlock,
	createDefaultCustomBlock,
	createDefaultEndOfBoreholeBlock,
	createDefaultFallingHeadPermeabilityTestBlock,
	createDefaultHaBlock,
	createDefaultLugeonTestBlock,
	createDefaultMzBlock,
	createDefaultPressuremeterTestBlock,
	createDefaultPsBlock,
	createDefaultRisingHeadPermeabilityTestBlock,
	createDefaultSptBlock,
	createDefaultUdBlock,
	createDefaultVaneShearTestBlock,
	createDefaultWashBoringBlock,
	type Block,
	type BlockTypeId,
} from '@mmsb/core';

import { COLUMN_COUNT } from '../src/layout/constants.ts';
import { assertRowOccupancy, buildBodyRow } from '../src/rows/buildBodyRow.ts';
import type { CellContent } from '../src/model/table.ts';

const EPOCH = new Date(0);

const FACTORIES: Record<BlockTypeId, () => Block> = {
	[SPT_BLOCK_TYPE_ID]: createDefaultSptBlock,
	[CORING_BLOCK_TYPE_ID]: createDefaultCoringBlock,
	[CAVITY_BLOCK_TYPE_ID]: createDefaultCavityBlock,
	[UD_BLOCK_TYPE_ID]: createDefaultUdBlock,
	[MZ_BLOCK_TYPE_ID]: createDefaultMzBlock,
	[PS_BLOCK_TYPE_ID]: createDefaultPsBlock,
	[HA_BLOCK_TYPE_ID]: createDefaultHaBlock,
	[WASH_BORING_BLOCK_TYPE_ID]: createDefaultWashBoringBlock,
	[CONCRETE_SLAB_BLOCK_TYPE_ID]: createDefaultConcreteSlabBlock,
	[ASPHALT_BLOCK_TYPE_ID]: createDefaultAsphaltBlock,
	[END_OF_BOREHOLE_BLOCK_TYPE_ID]: createDefaultEndOfBoreholeBlock,
	[CUSTOM_BLOCK_TYPE_ID]: createDefaultCustomBlock,
	[VANE_SHEAR_TEST_BLOCK_TYPE_ID]: createDefaultVaneShearTestBlock,
	[FALLING_HEAD_PERMEABILITY_TEST_BLOCK_TYPE_ID]: createDefaultFallingHeadPermeabilityTestBlock,
	[RISING_HEAD_PERMEABILITY_TEST_BLOCK_TYPE_ID]: createDefaultRisingHeadPermeabilityTestBlock,
	[CONSTANT_HEAD_PERMEABILITY_TEST_BLOCK_TYPE_ID]: createDefaultConstantHeadPermeabilityTestBlock,
	[LUGEON_TEST_BLOCK_TYPE_ID]: createDefaultLugeonTestBlock,
	[PRESSUREMETER_TEST_BLOCK_TYPE_ID]: createDefaultPressuremeterTestBlock,
};

/** Realistic values so the cells are not all blank defaults. */
function populate(block: Block): Block {
	const populated = {
		...block,
		id: `b-${block.blockTypeId}`,
		createdAt: EPOCH,
		topDepthInMetres: 2.0,
		baseDepthInMetres: 3.5,
		dayWorkStatus: {
			...block.dayWorkStatus,
			dayWorkStatusType: DAY_START_AND_END_WORK_TYPE,
			startDate: EPOCH,
			startTime: EPOCH,
			endDate: EPOCH,
			endTime: EPOCH,
			startWaterLevelInMetres: 1.25,
			endWaterLevelInMetres: 2.5,
		},
	} as Block;

	const overrides: Record<string, unknown> = {
		description: 'Firm silty CLAY',
		soilDescription: 'Firm silty CLAY',
		recoveryInPercentage: 87.5,
		sampleIndex: 3,
		sptIndex: 3,
		disturbedSampleIndex: 3,
		haSampleIndex: 3,
		rockSampleIndex: 3,
		permeabilityTestIndex: 1,
		lugeonTestIndex: 1,
		vaneShearTestIndex: 1,
		pressuremeterTestIndex: 1,
		seatingIncBlows1: 12,
		seatingIncBlows2: 13,
		seatingIncPen1: 75,
		seatingIncPen2: 75,
		mainIncBlows1: 14,
		mainIncBlows2: 15,
		mainIncBlows3: 10,
		mainIncBlows4: 11,
		mainIncPen1: 75,
		mainIncPen2: 75,
		mainIncPen3: 75,
		mainIncPen4: 75,
		sptNValue: 50,
		totalMainPenetrationInMillimetres: 240,
		coreRunInMetres: 1.5,
		coreRecoveryInPercentage: 92,
		rqdInPercentage: 45,
		remarks: 'Terminated on refusal',
	};
	for (const [key, value] of Object.entries(overrides)) {
		if (key in populated) {
			(populated as Record<string, unknown>)[key] = value;
		}
	}
	return populated;
}

function describe(content: CellContent): string {
	switch (content.kind) {
		case 'empty':
			return '·';
		case 'lines':
			return content.lines.join(' / ');
		case 'rich':
			return content.tokens.map((t) => (t.kind === 'break' ? '⏎' : t.italic ? `*${t.text}*` : t.text)).join('');
		case 'divided':
			return `${content.top}${content.hasRule ? '‾' : ' '}${content.bottom}`;
		case 'pinned':
			return `↑${content.top.join(' ')} ↓${content.bottom.join(' ')}`;
	}
}

const HEADINGS = ['DATE/TIME', 'SAMPLE', 'DEPTH', 'WL', 'DESCRIPTION', 'S1', 'S2', 'M1', 'M2', 'M3', 'M4', 'SPT(N)', 'R/r', 'SCALE'];

let failures = 0;

for (const blockTypeId of BLOCK_TYPE_ID_LIST) {
	const block = populate(FACTORIES[blockTypeId]());
	const row = buildBodyRow({ kind: 'block', block, testBlock: null, startTick: 20, tickCount: 15 }, 7);

	try {
		assertRowOccupancy(row);
	} catch (error) {
		failures += 1;
		console.log(`type ${blockTypeId}: OCCUPANCY FAILURE — ${(error as Error).message}`);
	}

	const byColumn = new Array<string>(COLUMN_COUNT).fill('');
	for (const cell of row.cells) {
		byColumn[cell.column] = describe(cell.content) + (cell.colSpan > 1 ? ` (span ${cell.colSpan})` : '');
	}

	console.log(`\ntype ${String(blockTypeId).padStart(2)}  ${row.mergedSptColumns ? '[merged SPT columns]' : ''}`);
	for (let i = 0; i < COLUMN_COUNT; i++) {
		if (byColumn[i] === '' || byColumn[i] === '·') continue;
		console.log(`   ${String(i).padStart(2)} ${HEADINGS[i].padEnd(12)} ${byColumn[i]}`);
	}
}

console.log(
	`\n${failures === 0 ? `All ${BLOCK_TYPE_ID_LIST.length} block types tile 14 columns exactly.` : `${failures} type(s) FAILED occupancy.`}`,
);
