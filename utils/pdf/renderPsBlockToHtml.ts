import { BaseBlock } from "@/interfaces/Block";
import { PsBlock } from "@/interfaces/PsBlock";
import { renderDayWorkStatusToHtml } from "@/utils/pdf/renderDayWorkStatusToHtml";
import { renderDepthInfoToHtml } from "@/utils/pdf/renderDepthInfoToHtml";
import { renderScaleTicksToHtml } from "@/utils/pdf/renderScaleTicksToHtml";
import { renderWaterLevelToHtml } from "./renderWaterLevelToHtml";
import { PS_SYMBOL } from "@/constants/symbol";
import { renderDescriptionToHtml } from "./renderDescriptionToHtml";

export function renderPsBlockToHtml(block: BaseBlock & PsBlock, numberOfTicksToRender: number,scaleTickIndexWrapper: number[]) {
    return (
        `
        <tr>
            ${renderDayWorkStatusToHtml(block.dayWorkStatus)}
            <td>
                <div>${PS_SYMBOL}${(block.recoveryInPercentage === 0) ? '*' : block.pistonSampleIndex}</div>
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