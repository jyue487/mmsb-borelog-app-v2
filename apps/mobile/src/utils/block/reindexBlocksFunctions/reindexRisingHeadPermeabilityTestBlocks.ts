import { BaseBlock, Block, RISING_HEAD_PERMEABILITY_TEST_BLOCK_TYPE_ID } from "@/src/interfaces/Block";
import { RisingHeadPermeabilityTestBlock } from "@/src/interfaces/RisingHeadPermeabilityTestBlock";

export function reindexRisingHeadPermeabilityTestBlocks(blocks: Block[]): Block[] {
  const updatedBlocks: Block[] = [];
  let permeabilityTestIndex: number = 1;
  for (const b of blocks) {
    if (b.blockTypeId !== RISING_HEAD_PERMEABILITY_TEST_BLOCK_TYPE_ID) {
      updatedBlocks.push(b);
      continue;
    }
    const updatedBlock: BaseBlock & RisingHeadPermeabilityTestBlock = { ...b };
    updatedBlock.permeabilityTestIndex = permeabilityTestIndex++;
    updatedBlocks.push(updatedBlock);
  }
  return updatedBlocks;
}