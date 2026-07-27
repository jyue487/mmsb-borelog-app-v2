import { BaseBlock, Block, PRESSUREMETER_TEST_BLOCK_TYPE_ID } from "@/src/interfaces/Block";
import { PressuremeterTestBlock } from "@/src/interfaces/PressuremeterTestBlock";

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