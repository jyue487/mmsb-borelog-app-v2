import { BaseBlock } from "@/interfaces/Block";
import { MzBlock } from "@/interfaces/MzBlock";
import { renderDayWorkStatusToHtml } from "@/utils/pdf/renderDayWorkStatusToHtml";
import { renderDepthInfoToHtml } from "@/utils/pdf/renderDepthInfoToHtml";
import { renderScaleTicksToHtml } from "@/utils/pdf/renderScaleTicksToHtml";
import { renderWaterLevelToHtml } from "./renderWaterLevelToHtml";
import { MZ_SYMBOL } from "@/constants/symbol";
import { renderDescriptionToHtml } from "./renderDescriptionToHtml";

export function renderMzBlockToHtml(block: BaseBlock & MzBlock, numberOfTicksToRender: number,scaleTickIndexWrapper: number[]) {
    return (
        `
        <tr>
            ${renderDayWorkStatusToHtml(block.dayWorkStatus)}
            <td>
                <div>${MZ_SYMBOL}${(block.recoveryInPercentage === 0) ? '*' : block.mazierSampleIndex}</div>
            </td>
            ${renderDepthInfoToHtml(block)}
            ${renderWaterLevelToHtml(block.dayWorkStatus)}
            ${renderDescriptionToHtml(numberOfTicksToRender, block.soilDescription)}
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td>${block.recoveryInPercentage.toFixed(1)}</td>
            ${renderScaleTicksToHtml(numberOfTicksToRender, scaleTickIndexWrapper)}
        </tr>
        `
    )
}