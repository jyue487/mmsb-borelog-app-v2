import { BaseBlock } from "@/interfaces/Block";
import { ConstantHeadPermeabilityTestBlock } from "@/interfaces/ConstantHeadPermeabilityTestBlock";

export function serializeConstantHeadPermeabilityTestBlock(block: BaseBlock & ConstantHeadPermeabilityTestBlock): string {
    return JSON.stringify(block);
}