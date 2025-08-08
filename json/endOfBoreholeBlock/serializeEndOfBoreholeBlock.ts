import { BaseBlock } from "@/interfaces/Block";
import { EndOfBoreholeBlock } from "@/interfaces/EndOfBoreholeBlock";

export function serializeEndOfBoreholeBlock(block: BaseBlock & EndOfBoreholeBlock): string {
    return JSON.stringify(block);
}