import { deleteBlockByBlockIdDbAsync } from "@/src/db/blocks/deleteBlockByBlockIdDbAsync";
import { Block } from "@/src/interfaces/Block";

export async function deleteBlockAsync(blocks: Block[], blockId: string): Promise<Block[]> {
  const updatedBlocks: Block[] = blocks.filter(b => b.id !== blockId);
  await deleteBlockByBlockIdDbAsync(blockId);
  return updatedBlocks;
}