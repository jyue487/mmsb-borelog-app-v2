import { addBlockDbAsync } from "@/db/blocks/addBlockDbAsync";
import { Block } from "@/interfaces/Block";

export async function addBlockAsync(
    blocks: Block[], 
    newBlock: Block,
): Promise<Block[]> {
    const updatedBlocks: Block[] = [...blocks, await addBlockDbAsync(newBlock)];
    return updatedBlocks;
};