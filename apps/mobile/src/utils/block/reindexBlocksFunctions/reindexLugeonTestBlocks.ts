import { BaseBlock, Block, LUGEON_TEST_BLOCK_TYPE_ID } from "@/src/interfaces/Block";
import { LugeonTestBlock } from "@/src/interfaces/LugeonTestBlock";

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