import { BaseBlock } from "@/src/interfaces/Block";
import { RisingHeadPermeabilityTestBlock } from "@/src/interfaces/RisingHeadPermeabilityTestBlock";

export function serializeRisingHeadPermeabilityTestBlock(block: BaseBlock & RisingHeadPermeabilityTestBlock): string {
    return JSON.stringify(block);
}