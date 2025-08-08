import { BaseBlock } from "@/interfaces/Block";
import { MzBlock } from "@/interfaces/MzBlock";

export function serializeMzBlock(block: BaseBlock & MzBlock): string {
    return JSON.stringify(block);
}