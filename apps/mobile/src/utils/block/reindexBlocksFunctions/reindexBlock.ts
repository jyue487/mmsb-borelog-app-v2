import * as BlockFile from '@mmsb/core';
import { Block, BlockTypeId } from '@mmsb/core';
import { reindexConstantHeadPermeabilityTestBlocks } from "./reindexConstantHeadPermeabilityTestBlocks";
import { reindexCoringBlocks } from "./reindexCoringBlocks";
import { reindexFallingHeadPermeabilityTestBlocks } from "./reindexFallingHeadPermeabilityTestBlocks";
import { reindexHaBlocks } from "./reindexHaBlocks";
import { reindexLugeonTestBlocks } from "./reindexLugeonTestBlocks";
import { reindexMzBlocks } from "./reindexMzBlocks";
import { reindexPressuremeterTestBlocks } from "./reindexPressuremeterTestBlocks";
import { reindexPsBlocks } from "./reindexPsBlocks";
import { reindexRisingHeadPermeabilityTestBlocks } from "./reindexRisingHeadPermeabilityTestBlocks";
import { reindexSptBlocks } from "./reindexSptBlocks";
import { reindexUdBlocks } from "./reindexUdBlocks";
import { reindexVaneShearTestBlocks } from "./reindexVaneShearTestBlocks";

const functions: Record<BlockTypeId, (blocks: Block[]) => Block[]> = {
  [BlockFile.SPT_BLOCK_TYPE_ID]: reindexSptBlocks,
  [BlockFile.CORING_BLOCK_TYPE_ID]: reindexCoringBlocks,
  [BlockFile.CAVITY_BLOCK_TYPE_ID]: (blocks: Block[]) => blocks,
  [BlockFile.UD_BLOCK_TYPE_ID]: reindexUdBlocks,
  [BlockFile.MZ_BLOCK_TYPE_ID]: reindexMzBlocks,
  [BlockFile.PS_BLOCK_TYPE_ID]: reindexPsBlocks,
  [BlockFile.HA_BLOCK_TYPE_ID]: reindexHaBlocks,
  [BlockFile.WASH_BORING_BLOCK_TYPE_ID]: (blocks: Block[]) => blocks,
  [BlockFile.CONCRETE_SLAB_BLOCK_TYPE_ID]: (blocks: Block[]) => blocks,
  [BlockFile.ASPHALT_BLOCK_TYPE_ID]: (blocks: Block[]) => blocks,
  [BlockFile.END_OF_BOREHOLE_BLOCK_TYPE_ID]: (blocks: Block[]) => blocks,
  [BlockFile.CUSTOM_BLOCK_TYPE_ID]: (blocks: Block[]) => blocks,
  [BlockFile.VANE_SHEAR_TEST_BLOCK_TYPE_ID]: reindexVaneShearTestBlocks,
  [BlockFile.FALLING_HEAD_PERMEABILITY_TEST_BLOCK_TYPE_ID]: reindexFallingHeadPermeabilityTestBlocks,
  [BlockFile.RISING_HEAD_PERMEABILITY_TEST_BLOCK_TYPE_ID]: reindexRisingHeadPermeabilityTestBlocks,
  [BlockFile.CONSTANT_HEAD_PERMEABILITY_TEST_BLOCK_TYPE_ID]: reindexConstantHeadPermeabilityTestBlocks,
  [BlockFile.LUGEON_TEST_BLOCK_TYPE_ID]: reindexLugeonTestBlocks,
  [BlockFile.PRESSUREMETER_TEST_BLOCK_TYPE_ID]: reindexPressuremeterTestBlocks,
};

export function reindexBlock(blocks: Block[], blockTypeId: BlockTypeId): Block[] {
  return functions[blockTypeId](blocks);
}

export function reindexAllBlocks(blocks: Block[]): Block[] {
  let updatedBlocks: Block[] = [...blocks];
  for (const blockTypeId of BlockFile.BLOCK_TYPE_ID_LIST) {
    updatedBlocks = reindexBlock(updatedBlocks, blockTypeId);
  }
  return updatedBlocks;
}