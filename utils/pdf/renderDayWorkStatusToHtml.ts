import { DAY_CONTINUE_WORK_TYPE, DAY_END_WORK_TYPE, DAY_START_WORK_TYPE, DayWorkStatus } from "@/constants/DayWorkStatus";
import { TEXT_SIZE_ANDROID, TEXT_SIZE_SMALLER_ANDROID, TEXT_SIZE_UNIT } from "@/constants/textSize";
import { getDate, getTime } from "@/utils/datetime";

export function renderDayWorkStatusToHtml(dayWorkStatus: DayWorkStatus) {
    return (
        `
        <td class="datetime" style="vertical-align: ${(dayWorkStatus.dayWorkStatusType === DAY_START_WORK_TYPE) ? 'top' : (dayWorkStatus.dayWorkStatusType === DAY_END_WORK_TYPE) ? 'bottom' : 'middle'};">
            ${(dayWorkStatus.dayWorkStatusType === DAY_CONTINUE_WORK_TYPE) ? '' : 
                `
                <div style="display: flex; flex: 1; flex-direction: column; align-items: center;">
                    <div style="transform: scale(0.67); line-height: 0.7;">${getDate(dayWorkStatus.date)}</div>
                    <div style="transform: scale(0.67); line-height: 0.7;">${getTime(dayWorkStatus.time)}</div>
                </div>
                `
            }
        </td>
        `
    );
}