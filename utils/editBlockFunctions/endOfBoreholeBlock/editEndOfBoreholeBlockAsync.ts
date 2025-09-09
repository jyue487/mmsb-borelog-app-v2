import { editBlockDbAsync } from "@/db/blocks/editBlockDbAsync";
import { BaseBlock, Block } from "@/interfaces/Block";
import { EndOfBoreholeBlock } from "@/interfaces/EndOfBoreholeBlock";

export async function editEndOfBoreholeBlockAsync(
    blocks: Block[], 
    oldBlockId: number,
    newBlock: BaseBlock & EndOfBoreholeBlock,
): Promise<Block[]> {
    const updatedBlock: Block = {...newBlock, id: oldBlockId};
    await editBlockDbAsync(updatedBlock);
    return blocks.map((b: Block) => (b.id === oldBlockId) ? {...updatedBlock} : {...b});
}