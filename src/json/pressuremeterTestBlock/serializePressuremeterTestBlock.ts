import { BaseBlock } from "@/src/interfaces/Block";
import { PressuremeterTestBlock } from "@/src/interfaces/PressuremeterTestBlock";

export function serializePressuremeterTestBlock(block: BaseBlock & PressuremeterTestBlock): string {
    return JSON.stringify(block);
}