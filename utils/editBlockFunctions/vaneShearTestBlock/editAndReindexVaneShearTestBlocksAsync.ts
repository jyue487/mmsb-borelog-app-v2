import { editBlockDbAsync } from "@/db/blocks/editBlockDbAsync";
import { BaseBlock, Block, VANE_SHEAR_TEST_BLOCK_TYPE_ID } from "@/interfaces/Block";
import { VaneShearTestBlock } from "@/interfaces/VaneShearTestBlock";
import { db } from "@/db/db";

export async function editAndReindexVaneShearTestBlocksAsync(
    blocks: Block[], 
    oldBlockId: number,
    newBlock: BaseBlock & VaneShearTestBlock
): Promise<Block[]> {
    const updatedBlocks: Block[] = [];
    let vaneShearTestIndex: number = 1;
    for (const b of blocks) {
        if (b.blockTypeId !== VANE_SHEAR_TEST_BLOCK_TYPE_ID) {
            updatedBlocks.push(b);
            continue;
        }
        const updatedBlock: BaseBlock & VaneShearTestBlock = (b.id === oldBlockId) ? {...newBlock, id: oldBlockId} : {...b};
        updatedBlock.vaneShearTestIndex = vaneShearTestIndex++;
        updatedBlocks.push(updatedBlock);
    }
    await db.withTransactionAsync(async () => {
        for (const b of updatedBlocks) {
            if (b.blockTypeId !== VANE_SHEAR_TEST_BLOCK_TYPE_ID) {
                continue;
            }
            await editBlockDbAsync(b);
        }
    });
    return updatedBlocks;
}