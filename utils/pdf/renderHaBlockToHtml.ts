import { BaseBlock } from "@/interfaces/Block";
import { HaBlock } from "@/interfaces/HaBlock";
import { renderDayWorkStatusToHtml } from "@/utils/pdf/renderDayWorkStatusToHtml";
import { renderDepthInfoToHtml } from "@/utils/pdf/renderDepthInfoToHtml";
import { renderScaleTicksToHtml } from "@/utils/pdf/renderScaleTicksToHtml";
import { renderWaterLevelToHtml } from "./renderWaterLevelToHtml";
import { HA_SYMBOL } from "@/constants/symbol";
import { renderDescriptionToHtml } from "./renderDescriptionToHtml";

export function renderHaBlockToHtml(block: BaseBlock & HaBlock, numberOfTicksToRender: number,scaleTickIndexWrapper: number[]) {
    return (
        `
        <tr>
            ${renderDayWorkStatusToHtml(block.dayWorkStatus)}
            <td>
                <div>${HA_SYMBOL}${block.haSampleIndex}</div>
            </td>
            ${renderDepthInfoToHtml(block)}
            ${renderWaterLevelToHtml(block.dayWorkStatus)}
            ${renderDescriptionToHtml(block.description)}
            <td></td>
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