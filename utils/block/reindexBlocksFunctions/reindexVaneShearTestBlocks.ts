import { BaseBlock, Block, VANE_SHEAR_TEST_BLOCK_TYPE_ID } from "@/interfaces/Block";
import { VaneShearTestBlock } from "@/interfaces/VaneShearTestBlock";

export function reindexVaneShearTestBlocks(blocks: Block[]): Block[] {
  const updatedBlocks: Block[] = [];
  let vaneShearTestIndex: number = 1;
  for (const b of blocks) {
    if (b.blockTypeId !== VANE_SHEAR_TEST_BLOCK_TYPE_ID) {
      updatedBlocks.push(b);
      continue;
    }
    const updatedBlock: BaseBlock & VaneShearTestBlock = { ...b };
    updatedBlock.vaneShearTestIndex = vaneShearTestIndex++;
    updatedBlocks.push(updatedBlock);
  }
  return updatedBlocks;
}