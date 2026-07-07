import { DAY_CONTINUE_WORK_TYPE, DayWorkStatus, WL_NIL, WL_FULL } from "@/constants/DayWorkStatus";
import { throwError } from "@/utils/error/throwError";
import { isNonNegative } from "@/utils/numbers";

export function checkAndReturnDayWorkStatus({
  dayWorkStatusType,
  date,
  time,
  waterLevelInMetres,
  casingDepthInMetres,
}: DayWorkStatus): DayWorkStatus {

  if (dayWorkStatusType === DAY_CONTINUE_WORK_TYPE) {
    return {
      dayWorkStatusType: dayWorkStatusType,
      date: date,
      time: time,
      waterLevelInMetres: waterLevelInMetres,
      casingDepthInMetres: casingDepthInMetres,
    };
  }

  if (waterLevelInMetres !== null) {
    if (typeof waterLevelInMetres === 'number') {
      if (!isNonNegative(waterLevelInMetres)) {
        throwError('Error: Water Level should not have a negative value');
      }
    } else if (typeof waterLevelInMetres === 'string') {
      waterLevelInMetres = waterLevelInMetres.trim().toUpperCase();
      if (waterLevelInMetres !== WL_NIL && waterLevelInMetres !== WL_FULL) {
        throwError('Error: Water Level should be either NIL or FULL');
      }
    }
  }
  if (casingDepthInMetres !== null && !isNonNegative(casingDepthInMetres)) {
    throwError('Error: Casing Depth');
  }

  return {
    dayWorkStatusType: dayWorkStatusType,
    date: date,
    time: time,
    waterLevelInMetres: waterLevelInMetres,
    casingDepthInMetres: casingDepthInMetres,
  };
}