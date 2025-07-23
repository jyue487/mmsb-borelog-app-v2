import { SptBlock } from "@/interfaces/SptBlock";
import { renderScaleTicks } from "@/utils/pdf/renderScaleTicks";
import { getDayOfMonth, getHours, getMinutes, getMonth, getYear } from "../datetime";
import { DAY_CONTINUE_WORK_TYPE, DAY_END_WORK_TYPE, DAY_START_WORK_TYPE } from "@/constants/DayStatus";

export function renderSptBlockToHtml(block: SptBlock, numberOfTicksToRender: number,scaleTickIndexWrapper: number[]) {
    return (
        `
        <tr style="height: ${numberOfTicksToRender * 6}px;">
            <td colspan="1" style="vertical-align: ${(block.dayWorkStatus.dayWorkStatusType === DAY_START_WORK_TYPE) ? 'top' : (block.dayWorkStatus.dayWorkStatusType === DAY_END_WORK_TYPE) ? 'bottom' : 'middle'};">
                ${(block.dayWorkStatus.dayWorkStatusType === DAY_CONTINUE_WORK_TYPE) ? '' : 
                    `
                    <div style="display: flex; flex: 1; flex-direction: column; align-items: center;">
                        <div>${getYear(block.dayWorkStatus.date)}</div>
                        <div>${getMonth(block.dayWorkStatus.date) + '/' + getDayOfMonth(block.dayWorkStatus.date)}</div>
                        <div>${getHours(block.dayWorkStatus.time) + ':' + getMinutes(block.dayWorkStatus.time)}</div>
                    </div>
                    `
                }
            </td>
            <td>
                <div>P${block.sptIndex}</div>
                <div>D${block.disturbedSampleIndex}</div>
            </td>
            <td>
                ${block.topDepthInMetres.toFixed(3)}<br>to<br>${block.baseDepthInMetres.toFixed(3)}
            </td>
            <td></td>
            <td class="description-cell">
                ${block.soilDescription}
            </td>
            <td></td>
            <td>
                <div style="display: flex; flex-direction: column; flex: 1; align-items: center; justify-content: center;">
                    <div>${(!block.seatingIncBlows1) ? '' : block.seatingIncBlows1}</div>
                    <div style="border-top: 1px solid black;">${block.seatingIncBlows1 && block.seatingIncBlows1 === 25 ? block.seatingIncPen1 + 'mm' : ''}</div>
                </div>
            </td>
            <td>
                <div style="display: flex; flex-direction: column; flex: 1; align-items: center; justify-content: center;">
                    <div>${(!block.seatingIncBlows2) ? '' : block.seatingIncBlows2}</div>
                    <div style="border-top: 1px solid black;">${block.seatingIncBlows2 && block.seatingIncBlows1 + block.seatingIncBlows2 === 25 ? block.seatingIncPen2 + 'mm' : ''}</div>
                </div>
            </td>
            <td>
                <div style="display: flex; flex-direction: column; flex: 1; align-items: center; justify-content: center;">
                    <div>${!(block.mainIncBlows1) ? '' : block.mainIncBlows1}</div>
                    <div style="border-top: 1px solid black;">${block.mainIncBlows1 && block.mainIncBlows1 === 50 ? block.mainIncPen1 + 'mm' : ''}</div>
                </div>
            </td>
            <td>
                <div style="display: flex; flex-direction: column; flex: 1; align-items: center; justify-content: center;">
                    <div>${!(block.mainIncBlows2) ? '' : block.mainIncBlows2}</div>
                    <div style="border-top: 1px solid black;">${block.mainIncBlows2 && block.mainIncBlows1 + block.mainIncBlows2 === 50 ? block.mainIncPen2 + 'mm' : ''}</div>
                </div>
            </td>
            <td>
                <div style="display: flex; flex-direction: column; flex: 1; align-items: center; justify-content: center;">
                    <div>${!(block.mainIncBlows3) ? '' : block.mainIncBlows3}</div>
                    <div style="border-top: 1px solid black;">${block.mainIncBlows3 && block.mainIncBlows1 + block.mainIncBlows2 + block.mainIncBlows3 === 50 ? block.mainIncPen3 + 'mm' : ''}</div>
                </div>
            </td>
            <td>
                <div style="display: flex; flex-direction: column; flex: 1; align-items: center; justify-content: center;">
                    <div>${!(block.mainIncBlows4) ? '' : block.mainIncBlows4}</div>
                    <div style="border-top: 1px solid black;">${block.mainIncBlows4 && block.mainIncBlows1 + block.mainIncBlows2 + block.mainIncBlows3 + block.mainIncBlows4 === 50 ? block.mainIncPen4 + 'mm' : ''}</div>
                </div>
            </td>
            <td>
                <div style="display: flex; flex-direction: column; flex: 1; align-items: center; justify-content: center;">
                    <div>${block.sptNValue}</div>
                    <div style="border-top: 1px solid black;">${block.sptNValue === 50 ? (block.mainIncPen1 + block.mainIncPen2 + block.mainIncPen3 + block.mainIncPen4) + 'mm' : ''}</div>
                </div>
            </td>
            <td>${(block.recoveryLengthInMillimetres / (block.baseDepthInMetres - block.topDepthInMetres) / 10).toFixed(0)}</td>
            <td class="scale">
                <div style="display: flex; flex-direction: column; align-items: flex-start;">
                    ${renderScaleTicks(numberOfTicksToRender, scaleTickIndexWrapper)}
                </div>
            </td>
        </tr>
        `
    )
}