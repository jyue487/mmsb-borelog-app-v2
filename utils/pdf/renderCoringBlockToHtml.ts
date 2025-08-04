import { CORING_SYMBOL } from "@/constants/symbol";
import { BaseBlock } from "@/interfaces/Block";
import { CoringBlock } from "@/interfaces/CoringBlock";
import { renderDayWorkStatusToHtml } from "@/utils/pdf/renderDayWorkStatusToHtml";
import { renderDepthInfoToHtml } from "@/utils/pdf/renderDepthInfoToHtml";
import { renderScaleTicksToHtml } from "@/utils/pdf/renderScaleTicksToHtml";
import { renderDescriptionToHtml } from "./renderDescriptionToHtml";
import { renderWaterLevelToHtml } from "./renderWaterLevelToHtml";
import { LugeonTestBlock } from "@/interfaces/LugeonTestBlock";

export function renderCoringBlockToHtml(
    block: BaseBlock & CoringBlock, 
    numberOfTicksToRender: number, 
    scaleTickIndexWrapper: number[],
    testBlock?: BaseBlock & LugeonTestBlock,
) {
    return (
        `
        <tr>
            ${renderDayWorkStatusToHtml(block.dayWorkStatus)}
            <td>
                <div>${CORING_SYMBOL}${(block.coreRecoveryInPercentage === 0) ? '*' : block.rockSampleIndex}</div>
                ${(!testBlock) ? '' : `<div>${testBlock.symbol}${testBlock.lugeonTestIndex}</div>`}
            </td>
            <td>
                <div>${renderDepthInfoToHtml(block)}</div>
                ${(!testBlock) ? '' : `<div>${renderDepthInfoToHtml(testBlock)}</div>`}
            </td>
            ${renderWaterLevelToHtml(block.dayWorkStatus)}
            ${renderDescriptionToHtml(numberOfTicksToRender, block.description + ((!testBlock) ? '' : `<br><i>${testBlock.description}</i>`))}
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