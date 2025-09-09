import { editBlockDbAsync } from "@/db/blocks/editBlockDbAsync";
import { BaseBlock, Block, LUGEON_TEST_BLOCK_TYPE_ID } from "@/interfaces/Block";
import { LugeonTestBlock } from "@/interfaces/LugeonTestBlock";
import { db } from "@/db/db";

export async function editAndReindexLugeonTestBlocksAsync(
    blocks: Block[], 
    oldBlockId: number,
    newBlock: BaseBlock & LugeonTestBlock
): Promise<Block[]> {
    const updatedBlocks: Block[] = [];
    let lugeonTestIndex: number = 1;
    for (const b of blocks) {
        if (b.blockTypeId !== LUGEON_TEST_BLOCK_TYPE_ID) {
            updatedBlocks.push(b);
            continue;
        }
        const updatedBlock: BaseBlock & LugeonTestBlock = (b.id === oldBlockId) ? {...newBlock, id: oldBlockId} : {...b};
        updatedBlock.lugeonTestIndex = lugeonTestIndex++;
        updatedBlocks.push(updatedBlock);
    }
    await db.withTransactionAsync(async () => {
        for (const b of updatedBlocks) {
            if (b.blockTypeId !== LUGEON_TEST_BLOCK_TYPE_ID) {
                continue;
            }
            await editBlockDbAsync(b);
        }
    });
    return updatedBlocks;
}