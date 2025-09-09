import { editBlockDbAsync } from "@/db/blocks/editBlockDbAsync";
import { BaseBlock, Block, UD_BLOCK_TYPE_ID } from "@/interfaces/Block";
import { UdBlock } from "@/interfaces/UdBlock";
import { db } from "@/db/db";

export async function editAndReindexUdBlocksAsync(
    blocks: Block[], 
    oldBlockId: number,
    newBlock: BaseBlock & UdBlock
): Promise<Block[]> {
    const updatedBlocks: Block[] = [];
    let sampleIndex: number = 1;
    for (const b of blocks) {
        if (b.blockTypeId !== UD_BLOCK_TYPE_ID) {
            updatedBlocks.push(b);
            continue;
        }
        const updatedBlock: BaseBlock & UdBlock = (b.id === oldBlockId) ? {...newBlock, id: oldBlockId} : {...b};
        updatedBlock.sampleIndex = (updatedBlock.recoveryInPercentage === 0) ? -1 : sampleIndex++;
        updatedBlocks.push(updatedBlock);
    }
    await db.withTransactionAsync(async () => {
        for (const b of updatedBlocks) {
            if (b.blockTypeId !== UD_BLOCK_TYPE_ID) {
                continue;
            }
            await editBlockDbAsync(b);
        }
    });
    return updatedBlocks;
}