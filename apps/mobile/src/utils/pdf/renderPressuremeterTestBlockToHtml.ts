import { PRESSUREMETER_TEST_SYMBOL } from "@/src/constants/symbol";
import { BaseBlock } from "@/src/interfaces/Block";
import { PressuremeterTestBlock } from "@/src/interfaces/PressuremeterTestBlock";
import { renderDayWorkStatusToHtml } from "@/src/utils/pdf/renderDayWorkStatusToHtml";
import { renderDepthInfoToHtml } from "@/src/utils/pdf/renderDepthInfoToHtml";
import { renderScaleTicksToHtml } from "@/src/utils/pdf/renderScaleTicksToHtml";
import { renderDescriptionToHtml } from "./renderDescriptionToHtml";
import { renderWaterLevelToHtml } from "./renderWaterLevelToHtml";

export function renderPressuremeterTestBlockToHtml(block: BaseBlock & PressuremeterTestBlock, numberOfTicksToRender: number, scaleTickIndexWrapper: number[]) {
    return (
        `
        <tr>
            ${renderDayWorkStatusToHtml(block.dayWorkStatus)}
            <td>
                <div>${PRESSUREMETER_TEST_SYMBOL}${block.pressuremeterTestIndex}</div>
            </td>
            <td>${renderDepthInfoToHtml(block)}</td>
            ${renderWaterLevelToHtml(block.dayWorkStatus)}
            ${renderDescriptionToHtml(numberOfTicksToRender, `<i>${block.description}</i>`)}
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