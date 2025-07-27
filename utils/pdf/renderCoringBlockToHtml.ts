import { BaseBlock } from "@/interfaces/Block";
import { CoringBlock } from "@/interfaces/CoringBlock";
import { renderDayWorkStatusToHtml } from "@/utils/pdf/renderDayWorkStatusToHtml";
import { renderDepthInfoToHtml } from "@/utils/pdf/renderDepthInfoToHtml";
import { renderScaleTicksToHtml } from "@/utils/pdf/renderScaleTicksToHtml";
import { renderWaterLevelToHtml } from "./renderWaterLevelToHtml";
import { CORING_SYMBOL, DISTURBED_SAMPLE_SYMBOL, SPT_SYMBOL } from "@/constants/symbol";
import { renderDescriptionToHtml } from "./renderDescriptionToHtml";

export function renderCoringBlockToHtml(block: BaseBlock & CoringBlock, numberOfTicksToRender: number,scaleTickIndexWrapper: number[]) {
    return (
        `
        <tr>
            ${renderDayWorkStatusToHtml(block.dayWorkStatus)}
            <td>
                <div>${CORING_SYMBOL}${(block.coreRecoveryInPercentage === 0) ? '*' : block.rockSampleIndex}</div>
            </td>
            ${renderDepthInfoToHtml(block)}
            ${renderWaterLevelToHtml(block.dayWorkStatus)}
            ${renderDescriptionToHtml(numberOfTicksToRender, block.rockDescription)}
            <td></td>
            <td colspan="2">
                <div style="display: flex; flex-direction: column; flex: 1; align-items: center; justify-content: center;">
                    <div>${block.coreRunInMetres}</div>
                </div>
            </td>
            <td colspan="2">
                <div style="display: flex; flex-direction: column; flex: 1; align-items: center; justify-content: center;">
                    <div>${block.rqdInPercentage}</div>
                </div>
            </td>
            <td colspan="2">
                <div style="display: flex; flex-direction: column; flex: 1; align-items: center; justify-content: center;">
                    <div>${block.coreRecoveryInPercentage}</div>
                </div>
            </td>
            <td></td>
            <td></td>
            ${renderScaleTicksToHtml(numberOfTicksToRender, scaleTickIndexWrapper)}
        </tr>
        `
    )
}