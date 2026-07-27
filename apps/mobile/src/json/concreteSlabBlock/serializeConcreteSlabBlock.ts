import { BaseBlock } from "@/src/interfaces/Block";
import { ConcreteSlabBlock } from "@/src/interfaces/ConcreteSlabBlock";

export function serializeConcreteSlabBlock(block: BaseBlock & ConcreteSlabBlock): string {
    return JSON.stringify(block);
}