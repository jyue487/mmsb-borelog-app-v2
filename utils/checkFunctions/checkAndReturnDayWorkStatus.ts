import { DAY_CONTINUE_WORK_TYPE, DayWorkStatus } from "@/constants/DayWorkStatus";
import { throwError } from "../error/throwError";
import { isNonNegative } from "../numbers";

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

    if (waterLevelInMetres !== null && !isNonNegative(waterLevelInMetres)) {
        throwError('Error: Water Level');
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