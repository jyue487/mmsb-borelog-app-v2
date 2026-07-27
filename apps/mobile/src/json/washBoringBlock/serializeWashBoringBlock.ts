import { BaseBlock } from "@/src/interfaces/Block";
import { WashBoringBlock } from "@/src/interfaces/WashBoringBlock";

export function serializeWashBoringBlock(block: BaseBlock & WashBoringBlock): string {
    return JSON.stringify(block);
}