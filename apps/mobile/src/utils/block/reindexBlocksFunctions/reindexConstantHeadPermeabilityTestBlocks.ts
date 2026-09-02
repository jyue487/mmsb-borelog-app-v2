import {
    BaseBlock,
    Block,
    CONSTANT_HEAD_PERMEABILITY_TEST_BLOCK_TYPE_ID,
    ConstantHeadPermeabilityTestBlock,
} from '@mmsb/core';

export function reindexConstantHeadPermeabilityTestBlocks(blocks: Block[]): Block[] {
  const updatedBlocks: Block[] = [];
  let permeabilityTestIndex: number = 1;
  for (const b of blocks) {
    if (b.blockTypeId !== CONSTANT_HEAD_PERMEABILITY_TEST_BLOCK_TYPE_ID) {
      updatedBlocks.push(b);
      continue;
    }
    const updatedBlock: BaseBlock & ConstantHeadPermeabilityTestBlock = { ...b };
    updatedBlock.permeabilityTestIndex = permeabilityTestIndex++;
    updatedBlocks.push(updatedBlock);
  }
  return updatedBlocks;
}