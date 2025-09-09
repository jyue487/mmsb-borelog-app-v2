import { editBlockDbAsync } from "@/db/blocks/editBlockDbAsync";
import { BaseBlock, Block } from "@/interfaces/Block";
import { CustomBlock } from "@/interfaces/CustomBlock";

export async function editCustomBlockAsync(
    blocks: Block[], 
    oldBlockId: number,
    newBlock: BaseBlock & CustomBlock,
): Promise<Block[]> {
    const updatedBlock: Block = {...newBlock, id: oldBlockId};
    await editBlockDbAsync(updatedBlock);
    return blocks.map((b: Block) => (b.id === oldBlockId) ? {...updatedBlock} : {...b});
}