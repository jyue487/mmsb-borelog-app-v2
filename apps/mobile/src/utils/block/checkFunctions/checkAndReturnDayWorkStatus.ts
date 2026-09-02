import {
  DAY_END_WORK_TYPE,
  DAY_START_AND_END_WORK_TYPE,
  DAY_START_WORK_TYPE,
  DayWorkStatus,
} from '@mmsb/core';
import { getDateTime } from "@/src/utils/datetime";
import { throwError } from "@/src/utils/error/throwError";
import { isNonNegative } from "@/src/utils/numbers";
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
    // getDateTime folds a date and a time held in two separate Date objects into one
    // formatted string, so the pair has to be re-parsed to be compared. Both sides are
    // non-null here, which is why this is `new Date` and not `toDate`.
    if (new Date(getDateTime(startDate, startTime)) > new Date(getDateTime(endDate, endTime))) {
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
