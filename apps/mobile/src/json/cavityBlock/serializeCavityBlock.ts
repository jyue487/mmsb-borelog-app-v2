import { BaseBlock } from "@/src/interfaces/Block";
import { CavityBlock } from "@/src/interfaces/CavityBlock";

export function serializeCavityBlock(block: BaseBlock & CavityBlock): string {
    return JSON.stringify(block);
}