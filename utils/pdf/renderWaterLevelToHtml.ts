import { DAY_CONTINUE_WORK_TYPE, DayWorkStatus } from "@/constants/DayWorkStatus";

export function renderWaterLevelToHtml(dayWorkStatus: DayWorkStatus) {
    if (dayWorkStatus.dayWorkStatusType === DAY_CONTINUE_WORK_TYPE) {
        return `<td></td>`;
    }
    if (!dayWorkStatus.waterLevelInMetres) {
        return `<td></td>`;
    }
    return `<td>${dayWorkStatus.waterLevelInMetres.toFixed(2)}</td>`;
}