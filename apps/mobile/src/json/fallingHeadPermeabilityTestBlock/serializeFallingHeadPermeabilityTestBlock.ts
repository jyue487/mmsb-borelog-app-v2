import { BaseBlock } from "@/src/interfaces/Block";
import { FallingHeadPermeabilityTestBlock } from "@/src/interfaces/FallingHeadPermeabilityTestBlock";

export function serializeFallingHeadPermeabilityTestBlock(block: BaseBlock & FallingHeadPermeabilityTestBlock): string {
    return JSON.stringify(block);
}