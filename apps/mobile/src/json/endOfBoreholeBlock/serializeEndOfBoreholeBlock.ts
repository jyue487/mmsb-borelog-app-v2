import { BaseBlock } from "@/src/interfaces/Block";
import { EndOfBoreholeBlock } from "@/src/interfaces/EndOfBoreholeBlock";

export function serializeEndOfBoreholeBlock(block: BaseBlock & EndOfBoreholeBlock): string {
    return JSON.stringify(block);
}