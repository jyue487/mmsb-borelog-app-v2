import { BaseBlock } from "@/interfaces/Block";
import { CavityBlock } from "@/interfaces/CavityBlock";

export function serializeCavityBlock(block: BaseBlock & CavityBlock): string {
    return JSON.stringify(block);
}