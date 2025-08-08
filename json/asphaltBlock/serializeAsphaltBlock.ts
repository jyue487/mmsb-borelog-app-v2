import { BaseBlock } from "@/interfaces/Block";
import { AsphaltBlock } from "@/interfaces/AsphaltBlock";

export function serializeAsphaltBlock(block: BaseBlock & AsphaltBlock): string {
    return JSON.stringify(block);
}