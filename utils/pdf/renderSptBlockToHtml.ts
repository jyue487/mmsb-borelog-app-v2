import { DISTURBED_SAMPLE_SYMBOL, SPT_SYMBOL } from "@/constants/symbol";
import { BaseBlock } from "@/interfaces/Block";
import { SptBlock } from "@/interfaces/SptBlock";
import { renderDayWorkStatusToHtml } from "@/utils/pdf/renderDayWorkStatusToHtml";
import { renderDepthInfoToHtml } from "@/utils/pdf/renderDepthInfoToHtml";
import { renderScaleTicksToHtml } from "@/utils/pdf/renderScaleTicksToHtml";
import { renderDescriptionToHtml } from "./renderDescriptionToHtml";
import { renderWaterLevelToHtml } from "./renderWaterLevelToHtml";

export function renderSptBlockToHtml(block: BaseBlock & SptBlock, numberOfTicksToRender: number, scaleTickIndexWrapper: number[]) {
    return (
        `
        <tr>
            ${renderDayWorkStatusToHtml(block.dayWorkStatus)}
            <td>
                <div>${SPT_SYMBOL}${block.sptIndex}/${DISTURBED_SAMPLE_SYMBOL}${(block.recoveryInPercentage === 0) ? '*' : block.disturbedSampleIndex}</div>
            </td>
            ${renderDepthInfoToHtml(block)}
            ${renderWaterLevelToHtml(block.dayWorkStatus)}
            ${renderDescriptionToHtml(numberOfTicksToRender, block.description)}
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