import { DAY_CONTINUE_WORK_TYPE, DAY_END_WORK_TYPE, DAY_START_WORK_TYPE, DayWorkStatus, DayWorkStatusType } from "@/constants/DayStatus";
import { checkNonNegativeFloat, stringToDecimalPoint } from "../numbers";

export function checkAndReturnDayWorkStatus(
    dayWorkStatusType: DayWorkStatusType,
    dayStartWorkDate: Date | undefined,
    dayStartWorkTime: Date | undefined,
    dayEndWorkDate: Date | undefined,
    dayEndWorkTime: Date | undefined,
    waterLevelInMetresStr: string,
    casingDepthInMetresStr: string,
): DayWorkStatus | undefined {

    if (dayWorkStatusType === DAY_CONTINUE_WORK_TYPE) {
        return { dayWorkStatusType: dayWorkStatusType };
    }

    if (!checkNonNegativeFloat(waterLevelInMetresStr)) {
        alert('Error: Water Level');
        return;
    }
    if (!checkNonNegativeFloat(casingDepthInMetresStr)) {
        alert('Error: Casing Depth');
        return;
    }
    const waterLevelInMetres: number = stringToDecimalPoint(waterLevelInMetresStr, 3);
    const casingDepthInMetres: number = stringToDecimalPoint(casingDepthInMetresStr, 3);

    if (dayWorkStatusType === DAY_START_WORK_TYPE) {
        if (!dayStartWorkDate) {
            alert('Error: Start Work Date');
            return;
        }
        if (!dayStartWorkTime) {
            alert('Error: Start Work Time');
            return;
        }
        return {
            dayWorkStatusType: dayWorkStatusType,
            date: dayStartWorkDate,
            time: dayStartWorkTime,
            waterLevelInMetres: waterLevelInMetres,
            casingDepthInMetres: casingDepthInMetres,
        };
    }
    if (dayWorkStatusType === DAY_END_WORK_TYPE) {
        if (!dayEndWorkDate) {
            alert('Error: End Work Date');
            return;
        }
        if (!dayEndWorkTime) {
            alert('Error: End Work Time');
            return;
        }
        return {
            dayWorkStatusType: dayWorkStatusType,
            date: dayEndWorkDate,
            time: dayEndWorkTime,
            waterLevelInMetres: waterLevelInMetres,
            casingDepthInMetres: casingDepthInMetres,
        };
    }
    return;
}