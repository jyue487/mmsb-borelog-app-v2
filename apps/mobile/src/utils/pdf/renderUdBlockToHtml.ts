import { UD_SYMBOL } from "@/src/constants/symbol";
import { BaseBlock } from "@/src/interfaces/Block";
import { ConstantHeadPermeabilityTestBlock } from "@/src/interfaces/ConstantHeadPermeabilityTestBlock";
import { FallingHeadPermeabilityTestBlock } from "@/src/interfaces/FallingHeadPermeabilityTestBlock";
import { RisingHeadPermeabilityTestBlock } from "@/src/interfaces/RisingHeadPermeabilityTestBlock";
import { UdBlock } from "@/src/interfaces/UdBlock";
import { renderDayWorkStatusToHtml } from "@/src/utils/pdf/renderDayWorkStatusToHtml";
import { renderDepthInfoToHtml } from "@/src/utils/pdf/renderDepthInfoToHtml";
import { renderScaleTicksToHtml } from "@/src/utils/pdf/renderScaleTicksToHtml";
import { renderDescriptionToHtml } from "./renderDescriptionToHtml";
import { renderWaterLevelToHtml } from "./renderWaterLevelToHtml";

export function renderUdBlockToHtml(
    block: BaseBlock & UdBlock, 
    numberOfTicksToRender: number, 
    scaleTickIndexWrapper: number[],
    testBlock?: BaseBlock & (
        FallingHeadPermeabilityTestBlock 
        | RisingHeadPermeabilityTestBlock 
        | ConstantHeadPermeabilityTestBlock
    ),
) {
    return (
        `
        <tr>
            ${renderDayWorkStatusToHtml(block.dayWorkStatus)}
            <td>
                <div>${UD_SYMBOL}${(block.recoveryInPercentage === 0) ? '*' : block.sampleIndex}</div>
                ${(!testBlock) ? '' : `<div>${testBlock.symbol}${testBlock.permeabilityTestIndex}</div>`}
            </td>
            <td>
                <div>${renderDepthInfoToHtml(block)}</div>
                ${(!testBlock) ? '' : `<div>${renderDepthInfoToHtml(testBlock)}</div>`}
            </td>
            ${renderWaterLevelToHtml(block.dayWorkStatus)}
            ${renderDescriptionToHtml(numberOfTicksToRender, block.soilDescription + ((!testBlock) ? '' : `<br><i>${testBlock.description}</i>`))}
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