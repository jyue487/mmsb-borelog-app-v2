import { BaseBlock } from "@/interfaces/Block";
import { WashBoringBlock } from "@/interfaces/WashBoringBlock";

export function serializeWashBoringBlock(block: BaseBlock & WashBoringBlock): string {
    return JSON.stringify(block);
}