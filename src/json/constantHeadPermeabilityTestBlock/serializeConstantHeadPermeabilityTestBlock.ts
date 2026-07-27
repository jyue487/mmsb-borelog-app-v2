import { BaseBlock } from "@/src/interfaces/Block";
import { ConstantHeadPermeabilityTestBlock } from "@/src/interfaces/ConstantHeadPermeabilityTestBlock";

export function serializeConstantHeadPermeabilityTestBlock(block: BaseBlock & ConstantHeadPermeabilityTestBlock): string {
    return JSON.stringify(block);
}