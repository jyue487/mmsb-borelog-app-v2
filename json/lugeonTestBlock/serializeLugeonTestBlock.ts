import { BaseBlock } from "@/interfaces/Block";
import { LugeonTestBlock } from "@/interfaces/LugeonTestBlock";

export function serializeLugeonTestBlock(block: BaseBlock & LugeonTestBlock): string {
    return JSON.stringify(block);
}