import { DAY_CONTINUE_WORK_TYPE, DayWorkStatus, DAY_START_WORK_TYPE, DAY_END_WORK_TYPE, DAY_START_AND_END_WORK_TYPE } from "@/constants/DayWorkStatus";
import { deserializeDateTime } from "@/json/deserializeDateTime";
import { getDateTime } from "@/utils/datetime";
import { throwError } from "@/utils/error/throwError";
import { isNonNegative } from "@/utils/numbers";
import { checkAndReturnWaterLevelInMetres } from "./checkAndReturnWaterLevelInMetres";

function checkAndReturnCasingDepthInMetres(casingDepthInMetres: number | null): number | null {
  if (casingDepthInMetres !== null && !isNonNegative(casingDepthInMetres)) {
    throwError('Error: Casing Depth');
  }
  return casingDepthInMetres;
}

export function checkAndReturnDayWorkStatus({
  dayWorkStatusType,
  startDate,
  startTime,
  startWaterLevelInMetres,
  startCasingDepthInMetres,
  endDate,
  endTime,
  endWaterLevelInMetres,
  endCasingDepthInMetres,
}: DayWorkStatus): DayWorkStatus {

  if (dayWorkStatusType === DAY_START_WORK_TYPE || dayWorkStatusType === DAY_START_AND_END_WORK_TYPE) {
    startWaterLevelInMetres = checkAndReturnWaterLevelInMetres(startWaterLevelInMetres);
    startCasingDepthInMetres = checkAndReturnCasingDepthInMetres(startCasingDepthInMetres);
  }
  if (dayWorkStatusType === DAY_END_WORK_TYPE || dayWorkStatusType === DAY_START_AND_END_WORK_TYPE) {
    endWaterLevelInMetres = checkAndReturnWaterLevelInMetres(endWaterLevelInMetres);
    endCasingDepthInMetres = checkAndReturnCasingDepthInMetres(endCasingDepthInMetres);
  }
  if (dayWorkStatusType === DAY_START_AND_END_WORK_TYPE) {
    if (deserializeDateTime(getDateTime(startDate, startTime)) > deserializeDateTime(getDateTime(endDate, endTime))) {
      throwError('Start date time ');
    }
  }

  return {
    dayWorkStatusType: dayWorkStatusType,
    startDate: startDate,
    startTime: startTime,
    startWaterLevelInMetres: startWaterLevelInMetres,
    startCasingDepthInMetres: startCasingDepthInMetres,
    endDate: endDate,
    endTime: endTime,
    endWaterLevelInMetres: endWaterLevelInMetres,
    endCasingDepthInMetres: endCasingDepthInMetres,
  };
}
