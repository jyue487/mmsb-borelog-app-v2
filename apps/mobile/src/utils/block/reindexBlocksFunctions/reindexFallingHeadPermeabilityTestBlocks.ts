import {
    BaseBlock,
    Block,
    FALLING_HEAD_PERMEABILITY_TEST_BLOCK_TYPE_ID,
    FallingHeadPermeabilityTestBlock,
} from '@mmsb/core';

export function reindexFallingHeadPermeabilityTestBlocks(blocks: Block[]): Block[] {
  const updatedBlocks: Block[] = [];
  let permeabilityTestIndex: number = 1;
  for (const b of blocks) {
    if (b.blockTypeId !== FALLING_HEAD_PERMEABILITY_TEST_BLOCK_TYPE_ID) {
      updatedBlocks.push(b);
      continue;
    }
    const updatedBlock: BaseBlock & FallingHeadPermeabilityTestBlock = { ...b };
    updatedBlock.permeabilityTestIndex = permeabilityTestIndex++;
    updatedBlocks.push(updatedBlock);
  }
  return updatedBlocks;
}