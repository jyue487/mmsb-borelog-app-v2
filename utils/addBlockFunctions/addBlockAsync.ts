import { addBlockDbAsync } from "@/db/blocks/addBlockDbAsync";
import { Block } from "@/interfaces/Block";
import { db } from "@/db/db";

export async function addBlockAsync(
    blocks: Block[], 
    newBlock: Block,
): Promise<Block[]> {
    const updatedBlocks: Block[] = [...blocks, await addBlockDbAsync(db, newBlock)];
    return updatedBlocks;
};