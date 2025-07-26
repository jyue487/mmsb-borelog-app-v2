import { Block } from "@/interfaces/Block";

export function renderDepthInfoToHtml(block: Block) {
    return (
        `
        <td>${block.topDepthInMetres.toFixed(3)} - ${block.baseDepthInMetres.toFixed(3)}</td>
        `
    );
}