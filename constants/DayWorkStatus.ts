export const DAY_START_WORK_TYPE = 'Day Start Work' as const;
export const DAY_CONTINUE_WORK_TYPE = 'Day Continue Work' as const;
export const DAY_END_WORK_TYPE = 'Day End Work' as const;
export const WL_NIL = 'NIL' as const;
export const WL_FULL = 'FULL' as const;

export const DAY_WORK_STATUS_TYPE_LIST = [
  DAY_START_WORK_TYPE,
  DAY_CONTINUE_WORK_TYPE,
  DAY_END_WORK_TYPE,
] as const;
export type DayWorkStatusType = typeof DAY_WORK_STATUS_TYPE_LIST[number];

export const WL_STRING_TYPE_LIST = [
  WL_NIL,
  WL_FULL,
] as const;
export type WaterLevelStringType = typeof WL_STRING_TYPE_LIST[number];

export interface DayWorkStatus {
  dayWorkStatusType: DayWorkStatusType;
  date: Date;
  time: Date;
  waterLevelInMetres: number | string | null;
  casingDepthInMetres: number | null;
}
