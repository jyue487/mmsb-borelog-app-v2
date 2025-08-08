import { editBlockDbAsync } from "@/db/blocks/editBlockDbAsync";
import { BaseBlock, Block } from "@/interfaces/Block";
import { ConcreteSlabBlock } from "@/interfaces/ConcreteSlabBlock";

export async function editConcreteSlabBlockAsync(
    blocks: Block[], 
    oldBlockId: number,
    newBlock: BaseBlock & ConcreteSlabBlock,
): Promise<Block[]> {
    const updatedBlock: Block = {...newBlock, id: oldBlockId};
    await editBlockDbAsync(updatedBlock);
    return blocks.map((b: Block) => (b.id === oldBlockId) ? {...updatedBlock} : {...b});
}