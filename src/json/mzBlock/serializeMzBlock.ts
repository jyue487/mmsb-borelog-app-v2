import { BaseBlock } from "@/src/interfaces/Block";
import { MzBlock } from "@/src/interfaces/MzBlock";

export function serializeMzBlock(block: BaseBlock & MzBlock): string {
    return JSON.stringify(block);
}