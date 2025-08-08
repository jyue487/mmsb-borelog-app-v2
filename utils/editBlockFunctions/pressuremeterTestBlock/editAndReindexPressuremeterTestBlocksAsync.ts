import { editBlockDbAsync } from "@/db/blocks/editBlockDbAsync";
import { BaseBlock, Block, PRESSUREMETER_TEST_BLOCK_TYPE_ID } from "@/interfaces/Block";
import { PressuremeterTestBlock } from "@/interfaces/PressuremeterTestBlock";
import { db } from "@/db/db";

export async function editAndReindexPressuremeterTestBlocksAsync(
    blocks: Block[], 
    oldBlockId: number,
    newBlock: BaseBlock & PressuremeterTestBlock
): Promise<Block[]> {
    const updatedBlocks: Block[] = [];
    let pressuremeterTestIndex: number = 1;
    for (const b of blocks) {
        if (b.blockTypeId !== PRESSUREMETER_TEST_BLOCK_TYPE_ID) {
            updatedBlocks.push(b);
            continue;
        }
        const updatedBlock: BaseBlock & PressuremeterTestBlock = (b.id === oldBlockId) ? {...newBlock, id: oldBlockId} : {...b};
        updatedBlock.pressuremeterTestIndex = pressuremeterTestIndex++;
        updatedBlocks.push(updatedBlock);
    }
    await db.withTransactionAsync(async () => {
        for (const b of updatedBlocks) {
            if (b.blockTypeId !== PRESSUREMETER_TEST_BLOCK_TYPE_ID) {
                continue;
            }
            await editBlockDbAsync(b);
        }
    });
    return updatedBlocks;
}