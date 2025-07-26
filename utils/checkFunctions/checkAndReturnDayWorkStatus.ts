import { DAY_CONTINUE_WORK_TYPE, DAY_END_WORK_TYPE, DAY_START_WORK_TYPE, DayWorkStatus, DayWorkStatusType } from "@/constants/DayStatus";
import { isNonNegativeFloat, stringToDecimalPoint } from "../numbers";

type Params = {
    dayWorkStatusType: DayWorkStatusType;
    dayStartWorkDate: Date | undefined;
    dayStartWorkTime: Date | undefined;
    dayEndWorkDate: Date | undefined;
    dayEndWorkTime: Date | undefined;
    waterLevelInMetresStr: string;
    casingDepthInMetresStr: string;
};

export function checkAndReturnDayWorkStatus({
    dayWorkStatusType,
    dayStartWorkDate,
    dayStartWorkTime,
    dayEndWorkDate,
    dayEndWorkTime,
    waterLevelInMetresStr,
    casingDepthInMetresStr,
}: Params): DayWorkStatus | undefined {

    if (dayWorkStatusType === DAY_CONTINUE_WORK_TYPE) {
        return { dayWorkStatusType: dayWorkStatusType };
    }

    if (waterLevelInMetresStr.length > 0 && !isNonNegativeFloat(waterLevelInMetresStr)) {
        alert('Error: Water Level');
        return;
    }
    if (casingDepthInMetresStr.length > 0 && !isNonNegativeFloat(casingDepthInMetresStr)) {
        alert('Error: Casing Depth');
        return;
    }
    const waterLevelInMetres: number | undefined = (!waterLevelInMetresStr) ? undefined : stringToDecimalPoint(waterLevelInMetresStr, 3);
    const casingDepthInMetres: number | undefined = (!casingDepthInMetresStr) ? undefined : stringToDecimalPoint(casingDepthInMetresStr, 3);

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