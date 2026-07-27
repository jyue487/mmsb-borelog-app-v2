import { BaseBlock } from "@/src/interfaces/Block";
import { CustomBlock } from "@/src/interfaces/CustomBlock";

export function serializeCustomBlock(block: BaseBlock & CustomBlock): string {
    return JSON.stringify(block);
}