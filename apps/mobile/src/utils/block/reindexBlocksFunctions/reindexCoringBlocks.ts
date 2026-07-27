import { BaseBlock, Block, CORING_BLOCK_TYPE_ID } from "@/src/interfaces/Block";
import { CoringBlock } from "@/src/interfaces/CoringBlock";

export function reindexCoringBlocks(blocks: Block[]): Block[] {
  const updatedBlocks: Block[] = [];
  let rockSampleIndex: number = 1;
  for (const b of blocks) {
      if (b.blockTypeId !== CORING_BLOCK_TYPE_ID) {
          updatedBlocks.push(b);
          continue;
      }
      const updatedBlock: BaseBlock & CoringBlock = {...b};
      updatedBlock.rockSampleIndex = (updatedBlock.coreRecoveryInPercentage === 0) ? -1 : rockSampleIndex++;
      updatedBlocks.push(updatedBlock);
  }
	return updatedBlocks;
}