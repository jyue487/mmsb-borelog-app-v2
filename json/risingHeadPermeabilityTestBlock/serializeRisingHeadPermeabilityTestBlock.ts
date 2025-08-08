import { BaseBlock } from "@/interfaces/Block";
import { RisingHeadPermeabilityTestBlock } from "@/interfaces/RisingHeadPermeabilityTestBlock";

export function serializeRisingHeadPermeabilityTestBlock(block: BaseBlock & RisingHeadPermeabilityTestBlock): string {
    return JSON.stringify(block);
}