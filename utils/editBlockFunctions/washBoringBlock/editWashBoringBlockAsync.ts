import { editBlockDbAsync } from "@/db/blocks/editBlockDbAsync";
import { BaseBlock, Block } from "@/interfaces/Block";
import { WashBoringBlock } from "@/interfaces/WashBoringBlock";

export async function editWashBoringBlockAsync(
    blocks: Block[], 
    oldBlockId: number,
    newBlock: BaseBlock & WashBoringBlock,
): Promise<Block[]> {
    const updatedBlock: Block = {...newBlock, id: oldBlockId};
    await editBlockDbAsync(updatedBlock);
    return blocks.map((b: Block) => (b.id === oldBlockId) ? {...updatedBlock} : {...b});
}