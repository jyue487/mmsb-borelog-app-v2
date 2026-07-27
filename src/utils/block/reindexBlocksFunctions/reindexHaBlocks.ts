import { BaseBlock, Block, HA_BLOCK_TYPE_ID } from "@/src/interfaces/Block";
import { HaBlock } from "@/src/interfaces/HaBlock";

export function reindexHaBlocks(blocks: Block[]): Block[] {
  const updatedBlocks: Block[] = [];
  let haSampleIndex: number = 1;
  for (const b of blocks) {
    if (b.blockTypeId !== HA_BLOCK_TYPE_ID) {
      updatedBlocks.push(b);
      continue;
    }
    const updatedBlock: BaseBlock & HaBlock = { ...b };
    updatedBlock.haSampleIndex = haSampleIndex++;
    updatedBlocks.push(updatedBlock);
  }
  return updatedBlocks;
}