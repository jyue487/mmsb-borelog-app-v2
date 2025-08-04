import { UD_SYMBOL } from "@/constants/symbol";
import { BaseBlock } from "@/interfaces/Block";
import { UdBlock } from "@/interfaces/UdBlock";
import { renderDayWorkStatusToHtml } from "@/utils/pdf/renderDayWorkStatusToHtml";
import { renderDepthInfoToHtml } from "@/utils/pdf/renderDepthInfoToHtml";
import { renderScaleTicksToHtml } from "@/utils/pdf/renderScaleTicksToHtml";
import { renderDescriptionToHtml } from "./renderDescriptionToHtml";
import { renderWaterLevelToHtml } from "./renderWaterLevelToHtml";
import { FallingHeadPermeabilityTestBlock } from "@/interfaces/FallingHeadPermeabilityTestBlock";
import { RisingHeadPermeabilityTestBlock } from "@/interfaces/RisingHeadPermeabilityTestBlock";
import { ConstantHeadPermeabilityTestBlock } from "@/interfaces/ConstantHeadPermeabilityTestBlock";

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
            <td></td>
            <td>${block.recoveryInPercentage.toFixed(1)}</td>
            ${renderScaleTicksToHtml(numberOfTicksToRender, scaleTickIndexWrapper)}
        </tr>
        `
    )
}