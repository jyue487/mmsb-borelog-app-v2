import { deleteBlockByBlockIdDbAsync } from "@/db/blocks/deleteBlockByBlockIdDbAsync";
import { Block } from "@/interfaces/Block";

export async function deleteBlockAsync(blocks: Block[], blockId: string): Promise<Block[]> {
  const updatedBlocks: Block[] = blocks.filter(b => b.id !== blockId);
  await deleteBlockByBlockIdDbAsync(blockId);
  return updatedBlocks;
}