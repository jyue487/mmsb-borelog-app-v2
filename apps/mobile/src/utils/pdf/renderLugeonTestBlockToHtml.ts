import { LUGEON_TEST_SYMBOL } from "@/src/constants/symbol";
import { BaseBlock } from "@/src/interfaces/Block";
import { LugeonTestBlock } from "@/src/interfaces/LugeonTestBlock";
import { renderDayWorkStatusToHtml } from "@/src/utils/pdf/renderDayWorkStatusToHtml";
import { renderDepthInfoToHtml } from "@/src/utils/pdf/renderDepthInfoToHtml";
import { renderScaleTicksToHtml } from "@/src/utils/pdf/renderScaleTicksToHtml";
import { renderDescriptionToHtml } from "./renderDescriptionToHtml";
import { renderWaterLevelToHtml } from "./renderWaterLevelToHtml";

export function renderLugeonTestBlockToHtml(block: BaseBlock & LugeonTestBlock, numberOfTicksToRender: number, scaleTickIndexWrapper: number[]) {
    return (
        `
        <tr>
            ${renderDayWorkStatusToHtml(block.dayWorkStatus)}
            <td>
                <div>${LUGEON_TEST_SYMBOL}${block.lugeonTestIndex}</div>
            </td>
            <td>${renderDepthInfoToHtml(block)}</td>
            ${renderWaterLevelToHtml(block.dayWorkStatus)}
            ${renderDescriptionToHtml(numberOfTicksToRender, `<i>${block.description}</i>`)}
            <td colspan="2"></td>
            <td colspan="2"></td>
            <td colspan="2"></td>
            <td></td>
            <td></td>
            ${renderScaleTicksToHtml(numberOfTicksToRender, scaleTickIndexWrapper)}
        </tr>
        `
    )
}