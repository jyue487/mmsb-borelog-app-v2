import { CONSTANT_HEAD_PERMEABILITY_TEST_SYMBOL, DISTURBED_SAMPLE_SYMBOL, FALLING_HEAD_PERMEABILITY_TEST_SYMBOL, RISING_HEAD_PERMEABILITY_TEST_SYMBOL, SPT_SYMBOL } from "@/constants/symbol";
import { BaseBlock, FALLING_HEAD_PERMEABILITY_TEST_BLOCK_TYPE_ID, RISING_HEAD_PERMEABILITY_TEST_BLOCK_TYPE_ID } from "@/interfaces/Block";
import { SptBlock } from "@/interfaces/SptBlock";
import { renderDayWorkStatusToHtml } from "@/utils/pdf/renderDayWorkStatusToHtml";
import { renderDepthInfoToHtml } from "@/utils/pdf/renderDepthInfoToHtml";
import { renderScaleTicksToHtml } from "@/utils/pdf/renderScaleTicksToHtml";
import { renderDescriptionToHtml } from "./renderDescriptionToHtml";
import { renderWaterLevelToHtml } from "./renderWaterLevelToHtml";
import { FallingHeadPermeabilityTestBlock } from "@/interfaces/FallingHeadPermeabilityTestBlock";
import { RisingHeadPermeabilityTestBlock } from "@/interfaces/RisingHeadPermeabilityTestBlock";
import { ConstantHeadPermeabilityTestBlock } from "@/interfaces/ConstantHeadPermeabilityTestBlock";

export function renderSptBlockToHtml(
    block: BaseBlock & SptBlock, 
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
                <div>${SPT_SYMBOL}${block.sptIndex}/${DISTURBED_SAMPLE_SYMBOL}${(block.recoveryInPercentage === 0) ? '*' : block.disturbedSampleIndex}</div>
                ${(!testBlock) ? '' : `<div>${testBlock.symbol}${testBlock.permeabilityTestIndex}</div>`}
            </td>
            <td>
                <div>${renderDepthInfoToHtml(block)}</div>
                ${(!testBlock) ? '' : `<div>${renderDepthInfoToHtml(testBlock)}</div>`}
            </td>
            ${renderWaterLevelToHtml(block.dayWorkStatus)}
            ${renderDescriptionToHtml(numberOfTicksToRender, block.description + ((!testBlock) ? '' : `<br><i>${testBlock.description}</i>`))}
            <td></td>
            <td>
                <div style="display: flex; flex-direction: column; flex: 1; align-items: center; justify-content: center;">
                    <div>${block.seatingIncBlows1}</div>
                    <div style="border-top: 1px solid black;">${(block.seatingIncBlows1 === 25) ? block.seatingIncPen1 + 'mm' : ''}</div>
                </div>
            </td>
            <td>
                <div style="display: flex; flex-direction: column; flex: 1; align-items: center; justify-content: center;">
                    <div>${block.seatingIncBlows2 ?? ''}</div>
                    <div style="border-top: 1px solid black;">${(block.seatingIncBlows2 !== null) && (block.seatingIncBlows1 + block.seatingIncBlows2 === 25) ? block.seatingIncPen2 + 'mm' : ''}</div>
                </div>
            </td>
            <td>
                <div style="display: flex; flex-direction: column; flex: 1; align-items: center; justify-content: center;">
                    <div>${block.mainIncBlows1}</div>
                    <div style="border-top: 1px solid black;">${(block.mainIncBlows1 === 50) ? block.mainIncPen1 + 'mm' : ''}</div>
                </div>
            </td>
            <td>
                <div style="display: flex; flex-direction: column; flex: 1; align-items: center; justify-content: center;">
                    <div>${block.mainIncBlows2 ?? ''}</div>
                    <div style="border-top: 1px solid black;">${(block.mainIncBlows2 !== null) && (block.mainIncBlows1 + block.mainIncBlows2 === 50) ? block.mainIncPen2 + 'mm' : ''}</div>
                </div>
            </td>
            <td>
                <div style="display: flex; flex-direction: column; flex: 1; align-items: center; justify-content: center;">
                    <div>${block.mainIncBlows3 ?? ''}</div>
                    <div style="border-top: 1px solid black;">${(block.mainIncBlows2 !== null && block.mainIncBlows3 !== null) && (block.mainIncBlows1 + block.mainIncBlows2 + block.mainIncBlows3 === 50) ? block.mainIncPen3 + 'mm' : ''}</div>
                </div>
            </td>
            <td>
                <div style="display: flex; flex-direction: column; flex: 1; align-items: center; justify-content: center;">
                    <div>${block.mainIncBlows4 ?? ''}</div>
                    <div style="border-top: 1px solid black;">${(block.mainIncBlows2 !== null && block.mainIncBlows3 !== null && block.mainIncBlows4 !== null) && (block.mainIncBlows1 + block.mainIncBlows2 + block.mainIncBlows3 + block.mainIncBlows4 === 50) ? block.mainIncPen4 + 'mm' : ''}</div>
                </div>
            </td>
            <td>
                <div style="display: flex; flex-direction: column; flex: 1; align-items: center; justify-content: center;">
                    <div>${block.sptNValue}</div>
                    <div style="border-top: 1px solid black;">${block.sptNValue === 50 ? block.totalMainPenetrationInMillimetres + 'mm' : ''}</div>
                </div>
            </td>
            <td>${block.recoveryInPercentage.toFixed(1)}</td>
            ${renderScaleTicksToHtml(numberOfTicksToRender, scaleTickIndexWrapper)}
        </tr>
        `
    )
}