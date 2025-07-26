export const DAY_START_WORK_TYPE = 'Day Start Work' as const;
export const DAY_CONTINUE_WORK_TYPE = 'Day Continue Work' as const;
export const DAY_END_WORK_TYPE = 'Day End Work' as const;

export const DAY_WORK_STATUS_TYPE_LIST = [
  DAY_START_WORK_TYPE,
  DAY_CONTINUE_WORK_TYPE,
  DAY_END_WORK_TYPE,
] as const;
export type DayWorkStatusType = typeof DAY_WORK_STATUS_TYPE_LIST[number];

export interface DayStartWork {
  dayWorkStatusType: typeof DAY_START_WORK_TYPE;
  date: Date;
  time: Date;
  waterLevelInMetres: number | undefined;
  casingDepthInMetres: number | undefined;
}

export interface DayContinueWork {
  dayWorkStatusType: typeof DAY_CONTINUE_WORK_TYPE;
}

export interface DayEndWork {
  dayWorkStatusType: typeof DAY_END_WORK_TYPE;
  date: Date;
  time: Date;
  waterLevelInMetres: number | undefined;
  casingDepthInMetres: number | undefined;
}

export interface DayWorkStatuses {
  DayStartWork: DayStartWork;
  DayContinueWork: DayContinueWork;
  DayEndWork: DayEndWork;
}

export type DayWorkStatus<K extends keyof DayWorkStatuses = keyof DayWorkStatuses> = DayWorkStatuses[K];
