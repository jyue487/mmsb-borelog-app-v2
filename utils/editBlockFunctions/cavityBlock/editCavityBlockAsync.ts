import { editBlockDbAsync } from "@/db/blocks/editBlockDbAsync";
import { BaseBlock, Block, CAVITY_BLOCK_TYPE_ID } from "@/interfaces/Block";
import { CavityBlock } from "@/interfaces/CavityBlock";

export async function editCavityBlockAsync(
    blocks: Block[], 
    oldBlockId: number,
    newBlock: BaseBlock & CavityBlock,
): Promise<Block[]> {
    const updatedBlock: Block = {...newBlock, id: oldBlockId};
    await editBlockDbAsync(updatedBlock);
    return blocks.map((b: Block) => (b.id === oldBlockId) ? {...updatedBlock} : {...b});
}