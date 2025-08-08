import { editBlockDbAsync } from "@/db/blocks/editBlockDbAsync";
import { BaseBlock, Block, FALLING_HEAD_PERMEABILITY_TEST_BLOCK_TYPE_ID } from "@/interfaces/Block";
import { FallingHeadPermeabilityTestBlock } from "@/interfaces/FallingHeadPermeabilityTestBlock";
import { db } from "@/db/db";

export async function editAndReindexFallingHeadPermeabilityTestBlocksAsync(
    blocks: Block[], 
    oldBlockId: number,
    newBlock: BaseBlock & FallingHeadPermeabilityTestBlock
): Promise<Block[]> {
    const updatedBlocks: Block[] = [];
    let permeabilityTestIndex: number = 1;
    for (const b of blocks) {
        if (b.blockTypeId !== FALLING_HEAD_PERMEABILITY_TEST_BLOCK_TYPE_ID) {
            updatedBlocks.push(b);
            continue;
        }
        const updatedBlock: BaseBlock & FallingHeadPermeabilityTestBlock = (b.id === oldBlockId) ? {...newBlock, id: oldBlockId} : {...b};
        updatedBlock.permeabilityTestIndex = permeabilityTestIndex++;
        updatedBlocks.push(updatedBlock);
    }
    await db.withTransactionAsync(async () => {
        for (const b of updatedBlocks) {
            if (b.blockTypeId !== FALLING_HEAD_PERMEABILITY_TEST_BLOCK_TYPE_ID) {
                continue;
            }
            await editBlockDbAsync(b);
        }
    });
    return updatedBlocks;
}