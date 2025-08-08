import { DayWorkStatus } from "@/constants/DayWorkStatus";
import { deserializeDateTime } from "./deserializeDateTime";

export function deserializeDayWorkStatus(dayWorkStatus: any): DayWorkStatus {
    return {
        dayWorkStatusType: dayWorkStatus.dayWorkStatusType,
        date: deserializeDateTime(dayWorkStatus.date),
        time: deserializeDateTime(dayWorkStatus.time),
        waterLevelInMetres: dayWorkStatus.waterLevelInMetres,
        casingDepthInMetres: dayWorkStatus.casingDepthInMetres,
    };
}