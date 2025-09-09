import { editBlockDbAsync } from "@/db/blocks/editBlockDbAsync";
import { BaseBlock, Block, SPT_BLOCK_TYPE_ID } from "@/interfaces/Block";
import { SptBlock } from "@/interfaces/SptBlock";
import { db } from "@/db/db";

export async function editAndReindexSptBlocksAsync(
    blocks: Block[], 
    oldBlockId: number, 
    newBlock: BaseBlock & SptBlock
): Promise<Block[]> {
    const updatedBlocks: Block[] = [];
    let sptIndex: number = 1;
    let disturbedSampleIndex: number = 1;
    for (const b of blocks) {
        if (b.blockTypeId !== SPT_BLOCK_TYPE_ID) {
            updatedBlocks.push(b);
            continue;
        }
        const updatedBlock: BaseBlock & SptBlock = (b.id === oldBlockId) ? {...newBlock, id: oldBlockId} : {...b};
        updatedBlock.sptIndex = sptIndex++;
        updatedBlock.disturbedSampleIndex = (updatedBlock.recoveryLengthInMillimetres === 0) ? -1 : disturbedSampleIndex++;
        updatedBlocks.push(updatedBlock);
    }
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