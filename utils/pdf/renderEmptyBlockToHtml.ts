import { renderScaleTicks } from "@/utils/pdf/renderScaleTicks";

export function renderEmptyBlockToHtml(numberOfTicksToRender: number, scaleTickIndexWrapper: number[]) {
    if (numberOfTicksToRender === 0) {
        return '';
    }
    return (
        `
        <tr style="height: ${numberOfTicksToRender * 6}px;">
            <td colspan="1" style="vertical-align: bottom;">
                <div style="display: flex; flex-direction: row;">
                    <div style="display: flex; flex: 1%; flex-direction: column; align-items: center; justify-content: flex-end;">
                        <div class="date-time"></div>
                    </div>
                </div>
            </td>
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
            <td></td>
            <td class="scale">
                <div style="display: flex; flex-direction: column; align-items: flex-start;">
                    ${renderScaleTicks(numberOfTicksToRender, scaleTickIndexWrapper)}
                </div>
            </td>
        </tr>
        `
    )
}