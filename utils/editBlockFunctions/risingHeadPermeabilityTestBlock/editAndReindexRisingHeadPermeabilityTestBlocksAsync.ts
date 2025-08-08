import { editBlockDbAsync } from "@/db/blocks/editBlockDbAsync";
import { BaseBlock, Block, RISING_HEAD_PERMEABILITY_TEST_BLOCK_TYPE_ID } from "@/interfaces/Block";
import { RisingHeadPermeabilityTestBlock } from "@/interfaces/RisingHeadPermeabilityTestBlock";
import { db } from "@/db/db";

export async function editAndReindexRisingHeadPermeabilityTestBlocksAsync(
    blocks: Block[], 
    oldBlockId: number,
    newBlock: BaseBlock & RisingHeadPermeabilityTestBlock
): Promise<Block[]> {
    const updatedBlocks: Block[] = [];
    let permeabilityTestIndex: number = 1;
    for (const b of blocks) {
        if (b.blockTypeId !== RISING_HEAD_PERMEABILITY_TEST_BLOCK_TYPE_ID) {
            updatedBlocks.push(b);
            continue;
        }
        const updatedBlock: BaseBlock & RisingHeadPermeabilityTestBlock = (b.id === oldBlockId) ? {...newBlock, id: oldBlockId} : {...b};
        updatedBlock.permeabilityTestIndex = permeabilityTestIndex++;
        updatedBlocks.push(updatedBlock);
    }
    await db.withTransactionAsync(async () => {
        for (const b of updatedBlocks) {
            if (b.blockTypeId !== RISING_HEAD_PERMEABILITY_TEST_BLOCK_TYPE_ID) {
                continue;
            }
            await editBlockDbAsync(b);
        }
    });
    return updatedBlocks;
}