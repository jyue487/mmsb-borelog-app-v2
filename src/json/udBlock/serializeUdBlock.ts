import { BaseBlock } from "@/src/interfaces/Block";
import { UdBlock } from "@/src/interfaces/UdBlock";

export function serializeUdBlock(block: BaseBlock & UdBlock): string {
    return JSON.stringify(block);
}