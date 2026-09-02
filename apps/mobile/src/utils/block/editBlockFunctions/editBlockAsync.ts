import { editBlockDbAsync } from "@/src/db/blocks/editBlockDbAsync";
import { Block } from "@/src/interfaces/Block";

/**
 * Replaces a block in the list and in the database, matching on its id.
 *
 * Same shape as addBlockAsync and deleteBlockAsync alongside it: a new array back,
 * never a mutation of the caller's — every screen holds its blocks in useState.
 *
 * The caller is responsible for the block carrying the id it is replacing. That is
 * what keeps its photos attached; see editBlockDbAsync.
 */
export async function editBlockAsync(blocks: Block[], updatedBlock: Block): Promise<Block[]> {
  const updatedBlocks: Block[] = blocks.map(b => (b.id === updatedBlock.id) ? updatedBlock : b);
  await editBlockDbAsync(updatedBlock);
  return updatedBlocks;
};
