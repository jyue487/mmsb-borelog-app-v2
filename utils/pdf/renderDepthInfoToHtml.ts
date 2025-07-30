import { Block } from "@/interfaces/Block";

export function renderDepthInfoToHtml(block: Block) {
    if (block.topDepthInMetres === -1 || block.baseDepthInMetres === -1) {
        return `<td></td>`;
    }
    return (
        `
        <td>${block.topDepthInMetres.toFixed(3)} - ${block.baseDepthInMetres.toFixed(3)}</td>
        `
    );
}