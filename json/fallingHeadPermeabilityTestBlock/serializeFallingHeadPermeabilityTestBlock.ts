import { BaseBlock } from "@/interfaces/Block";
import { FallingHeadPermeabilityTestBlock } from "@/interfaces/FallingHeadPermeabilityTestBlock";

export function serializeFallingHeadPermeabilityTestBlock(block: BaseBlock & FallingHeadPermeabilityTestBlock): string {
    return JSON.stringify(block);
}