import { editBlockDbAsync } from "@/db/blocks/editBlockDbAsync";
import { db } from "@/db/db";
import { BaseBlock, Block, SPT_BLOCK_TYPE_ID } from "@/interfaces/Block";
import { SptBlock } from "@/interfaces/SptBlock";
import { reindexSptBlocks } from "../../reindexBlocksFunctions/reindexSptBlocks";

export async function editAndReindexSptBlocksAsync(
	blocks: Block[],
	oldBlockId: string,
	newBlock: BaseBlock & SptBlock
): Promise<Block[]> {
	const updatedBlocks: Block[] = reindexSptBlocks(blocks);
	await db.withTransactionAsync(async () => {
		for (const b of updatedBlocks) {
			if (b.blockTypeId !== SPT_BLOCK_TYPE_ID) {
				continue;
			}
			await editBlockDbAsync(b);
		}
	});
	return updatedBlocks;
};