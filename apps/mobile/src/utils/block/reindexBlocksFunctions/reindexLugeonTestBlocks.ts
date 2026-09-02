import { BaseBlock, Block, LUGEON_TEST_BLOCK_TYPE_ID, LugeonTestBlock } from '@mmsb/core';

export function reindexLugeonTestBlocks(blocks: Block[]): Block[] {
  const updatedBlocks: Block[] = [];
  let lugeonTestIndex: number = 1;
  for (const b of blocks) {
    if (b.blockTypeId !== LUGEON_TEST_BLOCK_TYPE_ID) {
      updatedBlocks.push(b);
      continue;
    }
    const updatedBlock: BaseBlock & LugeonTestBlock = { ...b };
    updatedBlock.lugeonTestIndex = lugeonTestIndex++;
    updatedBlocks.push(updatedBlock);
  }
  return updatedBlocks;
}