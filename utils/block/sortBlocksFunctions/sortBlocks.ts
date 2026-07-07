import { Block } from "@/interfaces/Block";

export function sortBlocks(blocks: Block[]): Block[] {
	return blocks.sort((a, b) => a.topDepthInMetres - b.topDepthInMetres);
}