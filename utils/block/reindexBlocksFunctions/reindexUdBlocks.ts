import { BaseBlock, Block, UD_BLOCK_TYPE_ID } from "@/interfaces/Block";
import { UdBlock } from "@/interfaces/UdBlock";

export function reindexUdBlocks(blocks: Block[]): Block[] {
  const updatedBlocks: Block[] = [];
  let sampleIndex: number = 1;
  for (const b of blocks) {
    if (b.blockTypeId !== UD_BLOCK_TYPE_ID) {
      updatedBlocks.push(b);
      continue;
    }
    const updatedBlock: BaseBlock & UdBlock = { ...b };
    updatedBlock.sampleIndex = (updatedBlock.recoveryInPercentage === 0) ? -1 : sampleIndex++;
    updatedBlocks.push(updatedBlock);
  }
  return updatedBlocks;
}