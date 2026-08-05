import { createDefaultDayWorkStatus, DayWorkStatus } from '../constants/DayWorkStatus';
import { BaseBlock, CUSTOM_BLOCK_TYPE_ID } from './Block';

export interface CustomBlock {
  blockTypeId: typeof CUSTOM_BLOCK_TYPE_ID;
  dayWorkStatus: DayWorkStatus;
  topDepthInMetres: number;
  baseDepthInMetres: number;
  description: string;
}

export function createDefaultCustomBlock(): BaseBlock & CustomBlock {
  return {
    id: '',
    boreholeId: '',
    blockTypeId: CUSTOM_BLOCK_TYPE_ID,
    dayWorkStatus: createDefaultDayWorkStatus(),
    topDepthInMetres: -1,
    baseDepthInMetres: -1,
    description: '',
    createdAt: new Date(),
    updatedAt: null,
  };
}