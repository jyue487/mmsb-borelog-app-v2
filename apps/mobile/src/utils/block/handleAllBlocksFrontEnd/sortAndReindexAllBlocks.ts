import { Block } from '@mmsb/core';
import { reindexAllBlocks } from "../reindexBlocksFunctions/reindexBlock";
import { sortBlocks } from "../sortBlocksFunctions/sortBlocks";

export function sortAndReindexAllBlocks(blocks: Block[]): Block[] {
  return reindexAllBlocks(sortBlocks(blocks));
}