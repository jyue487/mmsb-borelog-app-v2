import { DAY_CONTINUE_WORK_TYPE, DayWorkStatus } from "@/constants/DayWorkStatus";
import { WaterLevelInMetres } from "@/constants/waterLevel";

export function renderWaterLevelToHtml(dayWorkStatus: DayWorkStatus) {
  if (dayWorkStatus.dayWorkStatusType === DAY_CONTINUE_WORK_TYPE) {
    return `<td></td>`;
  }
  if (dayWorkStatus.startWaterLevelInMetres === null && dayWorkStatus.endWaterLevelInMetres === null) {
    return `<td></td>`;
  }
  if (dayWorkStatus.startWaterLevelInMetres !== null && dayWorkStatus.endWaterLevelInMetres === null) {
    if (typeof dayWorkStatus.startWaterLevelInMetres === 'string') {
      return `<td>${dayWorkStatus.startWaterLevelInMetres}</td>`;
    }
    return `<td>${dayWorkStatus.startWaterLevelInMetres.toFixed(2)}</td>`;
  }
  if (dayWorkStatus.startWaterLevelInMetres === null && dayWorkStatus.endWaterLevelInMetres !== null) {
    if (typeof dayWorkStatus.endWaterLevelInMetres === 'string') {
      return `<td>${dayWorkStatus.endWaterLevelInMetres}</td>`;
    }
    return `<td>${dayWorkStatus.endWaterLevelInMetres.toFixed(2)}</td>`;
  }
  return (
    `
    <td>
      <div>${(typeof dayWorkStatus.startWaterLevelInMetres === 'string') ? dayWorkStatus.startWaterLevelInMetres : dayWorkStatus.startWaterLevelInMetres?.toFixed(2) ?? ''}</div>
      <div>${(typeof dayWorkStatus.endWaterLevelInMetres === 'string') ? dayWorkStatus.endWaterLevelInMetres : dayWorkStatus.endWaterLevelInMetres?.toFixed(2) ?? ''}</div>
    </td>
    `
  );
}