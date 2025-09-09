import { editBlockDbAsync } from "@/db/blocks/editBlockDbAsync";
import { BaseBlock, Block, CORING_BLOCK_TYPE_ID } from "@/interfaces/Block";
import { CoringBlock } from "@/interfaces/CoringBlock";
import { db } from "@/db/db";

export async function editAndReindexCoringBlocksAsync(
    blocks: Block[], 
    oldBlockId: number,
    newBlock: BaseBlock & CoringBlock
): Promise<Block[]> {
    const updatedBlocks: Block[] = [];
    let rockSampleIndex: number = 1;
    for (const b of blocks) {
        if (b.blockTypeId !== CORING_BLOCK_TYPE_ID) {
            updatedBlocks.push(b);
            continue;
        }
        const updatedBlock: BaseBlock & CoringBlock = (b.id === oldBlockId) ? {...newBlock, id: oldBlockId} : {...b};
        updatedBlock.rockSampleIndex = (updatedBlock.coreRecoveryInPercentage === 0) ? -1 : rockSampleIndex++;
        updatedBlocks.push(updatedBlock);
    }
    await db.withTransactionAsync(async () => {
        for (const b of updatedBlocks) {
            if (b.blockTypeId !== CORING_BLOCK_TYPE_ID) {
                continue;
            }
            await editBlockDbAsync(b);
        }
    });
    return updatedBlocks;
}