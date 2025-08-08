import { BaseBlock } from "@/interfaces/Block";
import { CoringBlock } from "@/interfaces/CoringBlock";

export function serializeCoringBlock(block: BaseBlock & CoringBlock): string {
    return JSON.stringify(block);
}