import { renderScaleTicksToHtml } from "@/utils/pdf/renderScaleTicksToHtml";

export function renderEmptyBlockToHtml(numberOfTicksToRender: number, scaleTickIndexWrapper: number[]) {
    if (numberOfTicksToRender === 0) {
        return '';
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