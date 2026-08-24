import {
  ASPHALT_BLOCK_TYPE_ID,
  CAVITY_BLOCK_TYPE_ID,
  CONCRETE_SLAB_BLOCK_TYPE_ID,
  CONSTANT_HEAD_PERMEABILITY_TEST_BLOCK_TYPE_ID,
  CONSTANT_HEAD_PERMEABILITY_TEST_SYMBOL,
  CORING_BLOCK_TYPE_ID,
  CORING_SYMBOL,
  CUSTOM_BLOCK_TYPE_ID,
  DISTURBED_SAMPLE_SYMBOL,
  END_OF_BOREHOLE_BLOCK_TYPE_ID,
  FALLING_HEAD_PERMEABILITY_TEST_BLOCK_TYPE_ID,
  FALLING_HEAD_PERMEABILITY_TEST_SYMBOL,
  HA_BLOCK_TYPE_ID,
  HA_SYMBOL,
  LUGEON_TEST_BLOCK_TYPE_ID,
  LUGEON_TEST_SYMBOL,
  MZ_BLOCK_TYPE_ID,
  MZ_SYMBOL,
  PRESSUREMETER_TEST_BLOCK_TYPE_ID,
  PRESSUREMETER_TEST_SYMBOL,
  PS_BLOCK_TYPE_ID,
  PS_SYMBOL,
  RISING_HEAD_PERMEABILITY_TEST_BLOCK_TYPE_ID,
  RISING_HEAD_PERMEABILITY_TEST_SYMBOL,
  SPT_BLOCK_TYPE_ID,
  SPT_SYMBOL,
  UD_BLOCK_TYPE_ID,
  UD_SYMBOL,
  VANE_SHEAR_TEST_BLOCK_TYPE_ID,
  VANE_SHEAR_TEST_SYMBOL,
  WASH_BORING_BLOCK_TYPE_ID,
  type Block,
  type BlockTypeId,
} from '@mmsb/core';

// The left gutter of a log row carries the depth interval and the sample labels.
// Which labels appear, and whether a depth is printed at all, is the only thing
// that varies per block type — the rest of the row is identical, so the variation
// is tabulated here instead of being fanned out over 18 components the way
// apps/mobile/src/components/blockComponents/ does it.

export type BlockGutterSpec = {
  /** Sample labels shown between the top and base depths, e.g. `P3` and `D3`. */
  labels: (block: Block) => string[];
  showsTopDepth: (block: Block) => boolean;
  showsBaseDepth: (block: Block) => boolean;
};

const ALWAYS = () => true;
const NEVER = () => false;
const NO_LABELS = () => [];

/**
 * A sample that recovered nothing is not given a number — the reindexer marks it
 * -1 — and prints as `*` on the log.
 */
function sampleLabel(symbol: string, index: number): string {
  return `${symbol}${index < 0 ? '*' : index}`;
}

/**
 * The rule is only consulted for the block type it is registered under, so
 * narrowing to that variant is safe here.
 */
function labelsOf<T extends Block>(read: (block: T) => string[]): (block: Block) => string[] {
  return (block) => read(block as T);
}

/**
 * The permeability tests are recorded at a single depth as often as over an
 * interval; when top and base coincide the base is left blank rather than
 * repeating the number.
 */
const hidesRepeatedBaseDepth = (block: Block) =>
  block.topDepthInMetres !== block.baseDepthInMetres;

function testSpec(symbol: string, read: (block: Block) => number): BlockGutterSpec {
  return {
    labels: (block) => [`${symbol}${read(block)}`],
    showsTopDepth: ALWAYS,
    showsBaseDepth: ALWAYS,
  };
}

function permeabilityTestSpec(symbol: string): BlockGutterSpec {
  return {
    labels: labelsOf<Block<'FallingHeadPermeabilityTest'>>((block) => [
      `${symbol}${block.permeabilityTestIndex}`,
    ]),
    showsTopDepth: ALWAYS,
    showsBaseDepth: hidesRepeatedBaseDepth,
  };
}

/** Cavity, wash boring, concrete slab and asphalt: a plain depth interval. */
const INTERVAL_ONLY: BlockGutterSpec = {
  labels: NO_LABELS,
  showsTopDepth: ALWAYS,
  showsBaseDepth: ALWAYS,
};

export const BLOCK_GUTTER_SPECS: Record<BlockTypeId, BlockGutterSpec> = {
  [SPT_BLOCK_TYPE_ID]: {
    labels: labelsOf<Block<'Spt'>>((block) => [
      `${SPT_SYMBOL}${block.sptIndex}`,
      sampleLabel(DISTURBED_SAMPLE_SYMBOL, block.disturbedSampleIndex),
    ]),
    showsTopDepth: ALWAYS,
    showsBaseDepth: ALWAYS,
  },
  [CORING_BLOCK_TYPE_ID]: {
    labels: labelsOf<Block<'Coring'>>((block) => [
      sampleLabel(CORING_SYMBOL, block.rockSampleIndex),
    ]),
    showsTopDepth: ALWAYS,
    showsBaseDepth: ALWAYS,
  },
  [CAVITY_BLOCK_TYPE_ID]: INTERVAL_ONLY,
  [UD_BLOCK_TYPE_ID]: {
    labels: labelsOf<Block<'Ud'>>((block) => [sampleLabel(UD_SYMBOL, block.sampleIndex)]),
    showsTopDepth: ALWAYS,
    showsBaseDepth: ALWAYS,
  },
  [MZ_BLOCK_TYPE_ID]: {
    labels: labelsOf<Block<'Mz'>>((block) => [sampleLabel(MZ_SYMBOL, block.sampleIndex)]),
    showsTopDepth: ALWAYS,
    showsBaseDepth: ALWAYS,
  },
  [PS_BLOCK_TYPE_ID]: {
    labels: labelsOf<Block<'Ps'>>((block) => [sampleLabel(PS_SYMBOL, block.sampleIndex)]),
    showsTopDepth: ALWAYS,
    showsBaseDepth: ALWAYS,
  },
  [HA_BLOCK_TYPE_ID]: testSpec(
    HA_SYMBOL,
    (block) => (block as Block<'Ha'>).haSampleIndex,
  ),
  [WASH_BORING_BLOCK_TYPE_ID]: INTERVAL_ONLY,
  [CONCRETE_SLAB_BLOCK_TYPE_ID]: INTERVAL_ONLY,
  [ASPHALT_BLOCK_TYPE_ID]: INTERVAL_ONLY,
  [END_OF_BOREHOLE_BLOCK_TYPE_ID]: {
    // The borehole ends here, so there is no interval to close.
    labels: NO_LABELS,
    showsTopDepth: ALWAYS,
    showsBaseDepth: NEVER,
  },
  [CUSTOM_BLOCK_TYPE_ID]: {
    // A custom block may be a free-standing note with no depth at all, which is
    // recorded as -1 rather than null.
    labels: NO_LABELS,
    showsTopDepth: (block) => block.topDepthInMetres !== -1,
    showsBaseDepth: (block) => block.baseDepthInMetres !== -1,
  },
  [VANE_SHEAR_TEST_BLOCK_TYPE_ID]: testSpec(
    VANE_SHEAR_TEST_SYMBOL,
    (block) => (block as Block<'VaneShearTest'>).vaneShearTestIndex,
  ),
  [FALLING_HEAD_PERMEABILITY_TEST_BLOCK_TYPE_ID]: permeabilityTestSpec(
    FALLING_HEAD_PERMEABILITY_TEST_SYMBOL,
  ),
  [RISING_HEAD_PERMEABILITY_TEST_BLOCK_TYPE_ID]: permeabilityTestSpec(
    RISING_HEAD_PERMEABILITY_TEST_SYMBOL,
  ),
  [CONSTANT_HEAD_PERMEABILITY_TEST_BLOCK_TYPE_ID]: permeabilityTestSpec(
    CONSTANT_HEAD_PERMEABILITY_TEST_SYMBOL,
  ),
  [LUGEON_TEST_BLOCK_TYPE_ID]: testSpec(
    LUGEON_TEST_SYMBOL,
    (block) => (block as Block<'LugeonTest'>).lugeonTestIndex,
  ),
  [PRESSUREMETER_TEST_BLOCK_TYPE_ID]: testSpec(
    PRESSUREMETER_TEST_SYMBOL,
    (block) => (block as Block<'PressuremeterTest'>).pressuremeterTestIndex,
  ),
};
