import { BaseBlock } from "@/interfaces/Block";
import { PsBlock } from "@/interfaces/PsBlock";

export function serializePsBlock(block: BaseBlock & PsBlock): string {
    return JSON.stringify(block);
}