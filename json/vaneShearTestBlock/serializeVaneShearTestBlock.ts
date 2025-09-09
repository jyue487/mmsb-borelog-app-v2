import { BaseBlock } from "@/interfaces/Block";
import { VaneShearTestBlock } from "@/interfaces/VaneShearTestBlock";

export function serializeVaneShearTestBlock(block: BaseBlock & VaneShearTestBlock): string {
    return JSON.stringify(block);
}