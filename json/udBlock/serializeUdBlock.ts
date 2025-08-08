import { BaseBlock } from "@/interfaces/Block";
import { UdBlock } from "@/interfaces/UdBlock";

export function serializeUdBlock(block: BaseBlock & UdBlock): string {
    return JSON.stringify(block);
}