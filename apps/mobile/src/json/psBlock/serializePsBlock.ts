import { BaseBlock } from "@/src/interfaces/Block";
import { PsBlock } from "@/src/interfaces/PsBlock";

export function serializePsBlock(block: BaseBlock & PsBlock): string {
    return JSON.stringify(block);
}