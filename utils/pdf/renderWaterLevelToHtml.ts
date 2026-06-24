import { DAY_CONTINUE_WORK_TYPE, DayWorkStatus } from "@/constants/DayWorkStatus";

export function renderWaterLevelToHtml(dayWorkStatus: DayWorkStatus) {
    if (dayWorkStatus.dayWorkStatusType === DAY_CONTINUE_WORK_TYPE) {
        return `<td></td>`;
    }
    if (dayWorkStatus.waterLevelInMetres === null) {
        return `<td></td>`;
    }
    if (typeof dayWorkStatus.waterLevelInMetres === 'string') {
        return `<td>${dayWorkStatus.waterLevelInMetres}</td>`;
    } 
    return `<td>${dayWorkStatus.waterLevelInMetres.toFixed(2)}</td>`;
}