import { BaseBlock } from "@/interfaces/Block";
import { SptBlock } from "@/interfaces/SptBlock";

export function serializeSptBlock(block: BaseBlock & SptBlock): string {
    return JSON.stringify(block);
}