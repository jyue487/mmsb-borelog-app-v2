import { editBlockDbAsync } from "@/db/blocks/editBlockDbAsync";
import { BaseBlock, Block, PS_BLOCK_TYPE_ID } from "@/interfaces/Block";
import { PsBlock } from "@/interfaces/PsBlock";
import { db } from "@/db/db";

export async function editAndReindexPsBlocksAsync(
    blocks: Block[], 
    oldBlockId: number,
    newBlock: BaseBlock & PsBlock
): Promise<Block[]> {
    const updatedBlocks: Block[] = [];
    let sampleIndex: number = 1;
    for (const b of blocks) {
        if (b.blockTypeId !== PS_BLOCK_TYPE_ID) {
            updatedBlocks.push(b);
            continue;
        }
        const updatedBlock: BaseBlock & PsBlock = (b.id === oldBlockId) ? {...newBlock, id: oldBlockId} : {...b};
        updatedBlock.sampleIndex = (updatedBlock.recoveryInPercentage === 0) ? -1 : sampleIndex++;
        updatedBlocks.push(updatedBlock);
    }
    await db.withTransactionAsync(async () => {
        for (const b of updatedBlocks) {
            if (b.blockTypeId !== PS_BLOCK_TYPE_ID) {
                continue;
            }
            await editBlockDbAsync(b);
        }
    });
    return updatedBlocks;
}