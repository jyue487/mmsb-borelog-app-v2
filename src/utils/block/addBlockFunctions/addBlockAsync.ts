import { addBlockDbAsync } from "@/src/db/blocks/addBlockDbAsync";
import { Block } from "@/src/interfaces/Block";

export async function addBlockAsync(blocks: Block[], newBlock: Block): Promise<Block[]> {
    const updatedBlocks: Block[] = [...blocks, await addBlockDbAsync(newBlock)];
    return updatedBlocks;
};