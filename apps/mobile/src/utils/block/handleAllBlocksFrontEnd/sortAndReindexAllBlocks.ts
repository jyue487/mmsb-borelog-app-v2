import { Block } from "@/src/interfaces/Block";
import { reindexAllBlocks } from "../reindexBlocksFunctions/reindexBlock";
import { sortBlocks } from "../sortBlocksFunctions/sortBlocks";

export function sortAndReindexAllBlocks(blocks: Block[]): Block[] {
  return reindexAllBlocks(sortBlocks(blocks));
}