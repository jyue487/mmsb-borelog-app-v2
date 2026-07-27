import { BaseBlock } from "@/src/interfaces/Block";
import { LugeonTestBlock } from "@/src/interfaces/LugeonTestBlock";

export function serializeLugeonTestBlock(block: BaseBlock & LugeonTestBlock): string {
    return JSON.stringify(block);
}