import { DayWorkStatus } from "@/src/constants/DayWorkStatus";
import { deserializeDateTime } from "./deserializeDateTime";

export function deserializeDayWorkStatus(dayWorkStatus: any): DayWorkStatus {
  return {
    dayWorkStatusType: dayWorkStatus.dayWorkStatusType,
    startDate: deserializeDateTime(dayWorkStatus.startDate),
    startTime: deserializeDateTime(dayWorkStatus.startTime),
    startWaterLevelInMetres: dayWorkStatus.startWaterLevelInMetres,
    startCasingDepthInMetres: dayWorkStatus.startCasingDepthInMetres,
    endDate: deserializeDateTime(dayWorkStatus.endDate),
    endTime: deserializeDateTime(dayWorkStatus.endTime),
    endWaterLevelInMetres: dayWorkStatus.endWaterLevelInMetres,
    endCasingDepthInMetres: dayWorkStatus.endCasingDepthInMetres,
  };
}