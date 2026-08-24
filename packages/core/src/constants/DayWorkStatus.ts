import type { WaterLevelInMetres } from "./waterLevel";

export const DAY_START_WORK_TYPE = 'Day Start Work' as const;
export const DAY_CONTINUE_WORK_TYPE = 'Day Continue Work' as const;
export const DAY_END_WORK_TYPE = 'Day End Work' as const;
export const DAY_START_AND_END_WORK_TYPE = 'Day Start and End Work' as const;

export const DAY_WORK_STATUS_TYPE_LIST = [
  DAY_START_WORK_TYPE,
  DAY_CONTINUE_WORK_TYPE,
  DAY_END_WORK_TYPE,
  DAY_START_AND_END_WORK_TYPE,
] as const;
export type DayWorkStatusType = typeof DAY_WORK_STATUS_TYPE_LIST[number];

export interface DayWorkStatus {
  dayWorkStatusType: DayWorkStatusType;
  startDate: Date;
  startTime: Date;
  startWaterLevelInMetres: WaterLevelInMetres;
  startCasingDepthInMetres: number | null;
  endDate: Date;
  endTime: Date;
  endWaterLevelInMetres: WaterLevelInMetres;
  endCasingDepthInMetres: number | null;
}

export function createDefaultDayWorkStatus(): DayWorkStatus {
  return {
    dayWorkStatusType: DAY_CONTINUE_WORK_TYPE,
    startDate: new Date(),
    startTime: new Date(),
    startWaterLevelInMetres: null,
    startCasingDepthInMetres: null,
    endDate: new Date(),
    endTime: new Date(),
    endWaterLevelInMetres: null,
    endCasingDepthInMetres: null,
  };
}