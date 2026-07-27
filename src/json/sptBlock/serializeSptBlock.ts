import { BaseBlock } from "@/src/interfaces/Block";
import { SptBlock } from "@/src/interfaces/SptBlock";

export function serializeSptBlock(block: BaseBlock & SptBlock): string {
    return JSON.stringify(block);
}