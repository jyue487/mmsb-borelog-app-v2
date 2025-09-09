import { Block } from "@/interfaces/Block";

export function renderDepthInfoToHtml(block: Block): string {
    if (block.topDepthInMetres === -1 || block.baseDepthInMetres === -1) {
        return '';
    }
    if (block.topDepthInMetres === block.baseDepthInMetres) {
        return block.topDepthInMetres.toFixed(3);
    }
    return `${block.topDepthInMetres.toFixed(3)} - ${block.baseDepthInMetres.toFixed(3)}`;
}