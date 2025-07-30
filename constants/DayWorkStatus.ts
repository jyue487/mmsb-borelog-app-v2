export const DAY_START_WORK_TYPE = 'Day Start Work' as const;
export const DAY_CONTINUE_WORK_TYPE = 'Day Continue Work' as const;
export const DAY_END_WORK_TYPE = 'Day End Work' as const;

export const DAY_WORK_STATUS_TYPE_LIST = [
  DAY_START_WORK_TYPE,
  DAY_CONTINUE_WORK_TYPE,
  DAY_END_WORK_TYPE,
] as const;
export type DayWorkStatusType = typeof DAY_WORK_STATUS_TYPE_LIST[number];

export interface DayWorkStatus {
  dayWorkStatusType: DayWorkStatusType;
  date: Date;
  time: Date;
  waterLevelInMetres: number | null;
  casingDepthInMetres: number | null;
}
