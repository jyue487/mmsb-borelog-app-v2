import { BaseBlock, Block, MZ_BLOCK_TYPE_ID } from "@/src/interfaces/Block";
import { MzBlock } from "@/src/interfaces/MzBlock";

export function reindexMzBlocks(blocks: Block[]): Block[] {
  const updatedBlocks: Block[] = [];
  let sampleIndex: number = 1;
  for (const b of blocks) {
    if (b.blockTypeId !== MZ_BLOCK_TYPE_ID) {
      updatedBlocks.push(b);
      continue;
    }
    const updatedBlock: BaseBlock & MzBlock = { ...b };
    updatedBlock.sampleIndex = (updatedBlock.recoveryInPercentage === 0) ? -1 : sampleIndex++;
    updatedBlocks.push(updatedBlock);
  }
  return updatedBlocks;
}