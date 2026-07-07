import * as BlockFile from "@/interfaces/Block";
import { Block, BlockTypeId } from "@/interfaces/Block";
import { reindexCoringBlocks } from "./reindexCoringBlocks";
import { reindexSptBlocks } from "./reindexSptBlocks";
import { reindexUdBlocks } from "./reindexUdBlocks";
import { reindexMzBlocks } from "./reindexMzBlocks";
import { reindexPsBlocks } from "./reindexPsBlocks";

const functions: Record<BlockTypeId, (blocks: Block[]) => Block[]> = {
  [BlockFile.SPT_BLOCK_TYPE_ID]: reindexSptBlocks,
  [BlockFile.CORING_BLOCK_TYPE_ID]: reindexCoringBlocks,
  [BlockFile.CAVITY_BLOCK_TYPE_ID]: (blocks: Block[]) => blocks,
  [BlockFile.UD_BLOCK_TYPE_ID]: reindexUdBlocks,
  [BlockFile.MZ_BLOCK_TYPE_ID]: reindexMzBlocks,
  [BlockFile.PS_BLOCK_TYPE_ID]: reindexPsBlocks,
  [BlockFile.HA_BLOCK_TYPE_ID]: (blocks: Block[]) => blocks,
  [BlockFile.WASH_BORING_BLOCK_TYPE_ID]: (blocks: Block[]) => blocks,
  [BlockFile.CONCRETE_SLAB_BLOCK_TYPE_ID]: (blocks: Block[]) => blocks,
  [BlockFile.ASPHALT_BLOCK_TYPE_ID]: (blocks: Block[]) => blocks,
  [BlockFile.END_OF_BOREHOLE_BLOCK_TYPE_ID]: (blocks: Block[]) => blocks,
  [BlockFile.CUSTOM_BLOCK_TYPE_ID]: (blocks: Block[]) => blocks,
  [BlockFile.VANE_SHEAR_TEST_BLOCK_TYPE_ID]: (blocks: Block[]) => blocks,
  [BlockFile.FALLING_HEAD_PERMEABILITY_TEST_BLOCK_TYPE_ID]: (blocks: Block[]) => blocks,
  [BlockFile.RISING_HEAD_PERMEABILITY_TEST_BLOCK_TYPE_ID]: (blocks: Block[]) => blocks,
  [BlockFile.CONSTANT_HEAD_PERMEABILITY_TEST_BLOCK_TYPE_ID]: (blocks: Block[]) => blocks,
  [BlockFile.LUGEON_TEST_BLOCK_TYPE_ID]: (blocks: Block[]) => blocks,
  [BlockFile.PRESSUREMETER_TEST_BLOCK_TYPE_ID]: (blocks: Block[]) => blocks,
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