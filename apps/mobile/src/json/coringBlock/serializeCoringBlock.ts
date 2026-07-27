import { BaseBlock } from "@/src/interfaces/Block";
import { CoringBlock } from "@/src/interfaces/CoringBlock";

export function serializeCoringBlock(block: BaseBlock & CoringBlock): string {
    return JSON.stringify(block);
}