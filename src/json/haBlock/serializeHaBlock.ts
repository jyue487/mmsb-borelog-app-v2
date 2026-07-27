import { BaseBlock } from "@/src/interfaces/Block";
import { HaBlock } from "@/src/interfaces/HaBlock";

export function serializeHaBlock(block: BaseBlock & HaBlock): string {
    return JSON.stringify(block);
}