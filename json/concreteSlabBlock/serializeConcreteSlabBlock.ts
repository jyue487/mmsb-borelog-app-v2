import { BaseBlock } from "@/interfaces/Block";
import { ConcreteSlabBlock } from "@/interfaces/ConcreteSlabBlock";

export function serializeConcreteSlabBlock(block: BaseBlock & ConcreteSlabBlock): string {
    return JSON.stringify(block);
}