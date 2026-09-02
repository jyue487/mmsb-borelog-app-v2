import { BaseBlock, Block, PS_BLOCK_TYPE_ID, PsBlock } from '@mmsb/core';

export function reindexPsBlocks(blocks: Block[]): Block[] {
  const updatedBlocks: Block[] = [];
  let sampleIndex: number = 1;
  for (const b of blocks) {
    if (b.blockTypeId !== PS_BLOCK_TYPE_ID) {
      updatedBlocks.push(b);
      continue;
    }
    const updatedBlock: BaseBlock & PsBlock = { ...b };
    updatedBlock.sampleIndex = (updatedBlock.recoveryInPercentage === 0) ? -1 : sampleIndex++;
    updatedBlocks.push(updatedBlock);
  }
  return updatedBlocks;
}