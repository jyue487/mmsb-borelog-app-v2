import { Block, BlockTypeId, CAVITY_BLOCK_TYPE_ID, CORING_BLOCK_TYPE_ID } from "@/interfaces/Block";
import { renderScaleTicksToHtml } from "@/utils/pdf/renderScaleTicksToHtml";

export function renderEmptyBlockToHtml(numberOfTicksToRender: number, scaleTickIndexWrapper: number[], referenceBlockTypeId: BlockTypeId) {
    if (numberOfTicksToRender === 0) {
        return '';
    }
    if (referenceBlockTypeId === CORING_BLOCK_TYPE_ID || referenceBlockTypeId === CAVITY_BLOCK_TYPE_ID) {
        return (
            `
            <tr>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td class="description-cell"></td>
                <td colspan="2"></td>
                <td colspan="2"></td>
                <td colspan="2"></td>
                <td></td>
                <td></td>
                ${renderScaleTicksToHtml(numberOfTicksToRender, scaleTickIndexWrapper)}
            </tr>
            `  
        );
    }
    return (
        `
        <tr>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td class="description-cell"></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            ${renderScaleTicksToHtml(numberOfTicksToRender, scaleTickIndexWrapper)}
        </tr>
        `
    )
}