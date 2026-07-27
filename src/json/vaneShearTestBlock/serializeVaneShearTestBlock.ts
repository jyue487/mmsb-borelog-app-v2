import { BaseBlock } from "@/src/interfaces/Block";
import { VaneShearTestBlock } from "@/src/interfaces/VaneShearTestBlock";

export function serializeVaneShearTestBlock(block: BaseBlock & VaneShearTestBlock): string {
    return JSON.stringify(block);
}