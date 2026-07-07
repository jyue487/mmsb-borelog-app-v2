import { BaseBlock, Block, SPT_BLOCK_TYPE_ID } from "@/interfaces/Block";
import { SptBlock } from "@/interfaces/SptBlock";

export function reindexSptBlocks(blocks: Block[]): Block[] {
	const updatedBlocks: Block[] = [];
	let sptIndex: number = 1;
	let disturbedSampleIndex: number = 1;
	for (const b of blocks) {
		if (b.blockTypeId !== SPT_BLOCK_TYPE_ID) {
			updatedBlocks.push(b);
			continue;
		}
		const updatedBlock: BaseBlock & SptBlock = { ...b };
		updatedBlock.sptIndex = sptIndex++;
		updatedBlock.disturbedSampleIndex = (updatedBlock.recoveryLengthInMillimetres === 0) ? -1 : disturbedSampleIndex++;
		updatedBlocks.push(updatedBlock);
	}
	return updatedBlocks;
}