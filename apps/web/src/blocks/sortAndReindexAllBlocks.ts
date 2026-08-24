import {
  ASPHALT_BLOCK_TYPE_ID,
  CAVITY_BLOCK_TYPE_ID,
  CONCRETE_SLAB_BLOCK_TYPE_ID,
  CONSTANT_HEAD_PERMEABILITY_TEST_BLOCK_TYPE_ID,
  CORING_BLOCK_TYPE_ID,
  CUSTOM_BLOCK_TYPE_ID,
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
  type Block,
  type BlockTypeId,
} from '@mmsb/core';

// Blocks carry no stored sort order or sequence number, so the list is recomputed
// after every fetch: sort by top depth, then renumber each block type's own counter
// from 1. Inserting a block at 3.5 m therefore renumbers everything below it.
//
// Mobile spreads this over 13 near-identical files under
// apps/mobile/src/utils/block/reindexBlocksFunctions/, but every one is the same
// loop over one field with one skip rule, so it collapses to the table below. The
// `Record<BlockTypeId, …>` keeps the exhaustiveness guarantee that mobile's own
// `Record` in reindexBlock.ts provides: a new block type is a compile error here.

type IndexField =
  | 'sptIndex'
  | 'disturbedSampleIndex'
  | 'rockSampleIndex'
  | 'sampleIndex'
  | 'haSampleIndex'
  | 'vaneShearTestIndex'
  | 'permeabilityTestIndex'
  | 'lugeonTestIndex'
  | 'pressuremeterTestIndex';

type ReindexRule = {
  field: IndexField;
  /**
   * When true the block is not numbered: it gets -1 and the counter does not
   * advance, which is how a zero-recovery sample ends up printed as `*`.
   */
  skip?: (block: Block) => boolean;
};

/**
 * The rule is only ever consulted for the block type it is registered under, so
 * narrowing to that variant is safe here.
 */
function whenZero<T extends Block>(read: (block: T) => number): (block: Block) => boolean {
  return (block) => read(block as T) === 0;
}

const NOT_NUMBERED: ReindexRule[] = [];

const REINDEX_RULES: Record<BlockTypeId, ReindexRule[]> = {
  [SPT_BLOCK_TYPE_ID]: [
    { field: 'sptIndex' },
    {
      field: 'disturbedSampleIndex',
      skip: whenZero<Block<'Spt'>>((block) => block.recoveryLengthInMillimetres),
    },
  ],
  [CORING_BLOCK_TYPE_ID]: [
    {
      field: 'rockSampleIndex',
      skip: whenZero<Block<'Coring'>>((block) => block.coreRecoveryInPercentage),
    },
  ],
  [CAVITY_BLOCK_TYPE_ID]: NOT_NUMBERED,
  [UD_BLOCK_TYPE_ID]: [
    {
      field: 'sampleIndex',
      skip: whenZero<Block<'Ud'>>((block) => block.recoveryInPercentage),
    },
  ],
  [MZ_BLOCK_TYPE_ID]: [
    {
      field: 'sampleIndex',
      skip: whenZero<Block<'Mz'>>((block) => block.recoveryInPercentage),
    },
  ],
  [PS_BLOCK_TYPE_ID]: [
    {
      field: 'sampleIndex',
      skip: whenZero<Block<'Ps'>>((block) => block.recoveryInPercentage),
    },
  ],
  [HA_BLOCK_TYPE_ID]: [{ field: 'haSampleIndex' }],
  [WASH_BORING_BLOCK_TYPE_ID]: NOT_NUMBERED,
  [CONCRETE_SLAB_BLOCK_TYPE_ID]: NOT_NUMBERED,
  [ASPHALT_BLOCK_TYPE_ID]: NOT_NUMBERED,
  [END_OF_BOREHOLE_BLOCK_TYPE_ID]: NOT_NUMBERED,
  [CUSTOM_BLOCK_TYPE_ID]: NOT_NUMBERED,
  [VANE_SHEAR_TEST_BLOCK_TYPE_ID]: [{ field: 'vaneShearTestIndex' }],
  [FALLING_HEAD_PERMEABILITY_TEST_BLOCK_TYPE_ID]: [{ field: 'permeabilityTestIndex' }],
  [RISING_HEAD_PERMEABILITY_TEST_BLOCK_TYPE_ID]: [{ field: 'permeabilityTestIndex' }],
  [CONSTANT_HEAD_PERMEABILITY_TEST_BLOCK_TYPE_ID]: [{ field: 'permeabilityTestIndex' }],
  [LUGEON_TEST_BLOCK_TYPE_ID]: [{ field: 'lugeonTestIndex' }],
  [PRESSUREMETER_TEST_BLOCK_TYPE_ID]: [{ field: 'pressuremeterTestIndex' }],
};

export function sortAndReindexAllBlocks(blocks: Block[]): Block[] {
  const sortedBlocks = [...blocks].sort(
    (first, second) => first.topDepthInMetres - second.topDepthInMetres,
  );

  // Each counter is per (block type, field): the three permeability tests share the
  // field name `permeabilityTestIndex` but number independently, exactly as mobile's
  // three separate reindex functions do.
  const counters = new Map<string, number>();

  return sortedBlocks.map((block) => {
    const rules = REINDEX_RULES[block.blockTypeId];

    if (rules.length === 0) {
      return block;
    }

    const reindexedBlock = { ...block } as Block & Record<IndexField, number>;

    for (const rule of rules) {
      const counterKey = `${block.blockTypeId}:${rule.field}`;

      if (rule.skip?.(block)) {
        reindexedBlock[rule.field] = -1;
        continue;
      }

      const nextIndex = counters.get(counterKey) ?? 1;

      reindexedBlock[rule.field] = nextIndex;
      counters.set(counterKey, nextIndex + 1);
    }

    return reindexedBlock;
  });
}
