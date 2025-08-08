import { BaseBlock } from "@/interfaces/Block";
import { HaBlock } from "@/interfaces/HaBlock";

export function serializeHaBlock(block: BaseBlock & HaBlock): string {
    return JSON.stringify(block);
}