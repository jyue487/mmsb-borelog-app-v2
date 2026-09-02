import {
    BaseBlock,
    Block,
    PRESSUREMETER_TEST_BLOCK_TYPE_ID,
    PressuremeterTestBlock,
} from '@mmsb/core';

export function reindexPressuremeterTestBlocks(blocks: Block[]): Block[] {
  const updatedBlocks: Block[] = [];
  let pressuremeterTestIndex: number = 1;
  for (const b of blocks) {
    if (b.blockTypeId !== PRESSUREMETER_TEST_BLOCK_TYPE_ID) {
      updatedBlocks.push(b);
      continue;
    }
    const updatedBlock: BaseBlock & PressuremeterTestBlock = { ...b };
    updatedBlock.pressuremeterTestIndex = pressuremeterTestIndex++;
    updatedBlocks.push(updatedBlock);
  }
  return updatedBlocks;
}