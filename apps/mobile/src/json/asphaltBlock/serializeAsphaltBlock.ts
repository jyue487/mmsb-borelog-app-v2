import { AsphaltBlock } from "@/src/interfaces/AsphaltBlock";
import { BaseBlock } from "@/src/interfaces/Block";

export function serializeAsphaltBlock(block: BaseBlock & AsphaltBlock): string {
    return JSON.stringify(block);
}