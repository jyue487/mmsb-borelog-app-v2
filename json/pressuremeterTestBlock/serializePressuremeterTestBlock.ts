import { BaseBlock } from "@/interfaces/Block";
import { PressuremeterTestBlock } from "@/interfaces/PressuremeterTestBlock";

export function serializePressuremeterTestBlock(block: BaseBlock & PressuremeterTestBlock): string {
    return JSON.stringify(block);
}