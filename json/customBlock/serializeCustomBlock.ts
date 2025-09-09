import { BaseBlock } from "@/interfaces/Block";
import { CustomBlock } from "@/interfaces/CustomBlock";

export function serializeCustomBlock(block: BaseBlock & CustomBlock): string {
    return JSON.stringify(block);
}