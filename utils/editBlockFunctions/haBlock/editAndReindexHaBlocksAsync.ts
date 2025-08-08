import { editBlockDbAsync } from "@/db/blocks/editBlockDbAsync";
import { BaseBlock, Block, HA_BLOCK_TYPE_ID } from "@/interfaces/Block";
import { HaBlock } from "@/interfaces/HaBlock";
import { db } from "@/db/db";

export async function editAndReindexHaBlocksAsync(
    blocks: Block[], 
    oldBlockId: number,
    newBlock: BaseBlock & HaBlock
): Promise<Block[]> {
    const updatedBlocks: Block[] = [];
    let haSampleIndex: number = 1;
    for (const b of blocks) {
        if (b.blockTypeId !== HA_BLOCK_TYPE_ID) {
            updatedBlocks.push(b);
            continue;
        }
        const updatedBlock: BaseBlock & HaBlock = (b.id === oldBlockId) ? {...newBlock, id: oldBlockId} : {...b};
        updatedBlock.haSampleIndex = haSampleIndex++;
        updatedBlocks.push(updatedBlock);
    }
    await db.withTransactionAsync(async () => {
        for (const b of updatedBlocks) {
            if (b.blockTypeId !== HA_BLOCK_TYPE_ID) {
                continue;
            }
            await editBlockDbAsync(b);
        }
    });
    return updatedBlocks;
}