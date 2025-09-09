import { editBlockDbAsync } from "@/db/blocks/editBlockDbAsync";
import { BaseBlock, Block, CONSTANT_HEAD_PERMEABILITY_TEST_BLOCK_TYPE_ID } from "@/interfaces/Block";
import { ConstantHeadPermeabilityTestBlock } from "@/interfaces/ConstantHeadPermeabilityTestBlock";
import { db } from "@/db/db";

export async function editAndReindexConstantHeadPermeabilityTestBlocksAsync(
    blocks: Block[], 
    oldBlockId: number,
    newBlock: BaseBlock & ConstantHeadPermeabilityTestBlock
): Promise<Block[]> {
    const updatedBlocks: Block[] = [];
    let permeabilityTestIndex: number = 1;
    for (const b of blocks) {
        if (b.blockTypeId !== CONSTANT_HEAD_PERMEABILITY_TEST_BLOCK_TYPE_ID) {
            updatedBlocks.push(b);
            continue;
        }
        const updatedBlock: BaseBlock & ConstantHeadPermeabilityTestBlock = (b.id === oldBlockId) ? {...newBlock, id: oldBlockId} : {...b};
        updatedBlock.permeabilityTestIndex = permeabilityTestIndex++;
        updatedBlocks.push(updatedBlock);
    }
    await db.withTransactionAsync(async () => {
        for (const b of updatedBlocks) {
            if (b.blockTypeId !== CONSTANT_HEAD_PERMEABILITY_TEST_BLOCK_TYPE_ID) {
                continue;
            }
            await editBlockDbAsync(b);
        }
    });
    return updatedBlocks;
}