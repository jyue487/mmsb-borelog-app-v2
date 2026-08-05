import { createDefaultDayWorkStatus, DayWorkStatus } from '../constants/DayWorkStatus';
import { BaseBlock, CAVITY_BLOCK_TYPE_ID } from './Block';

export interface CavityBlock {
  blockTypeId: typeof CAVITY_BLOCK_TYPE_ID;
  dayWorkStatus: DayWorkStatus;
  topDepthInMetres: number;
  baseDepthInMetres: number;
  description: string;
}

export function createDefaultCavityBlock(): BaseBlock & CavityBlock {
  return {
    id: '',
    boreholeId: '',
    blockTypeId: CAVITY_BLOCK_TYPE_ID,
    dayWorkStatus: createDefaultDayWorkStatus(),
    topDepthInMetres: -1,
    baseDepthInMetres: -1,
    description: '',
    createdAt: new Date(),
    updatedAt: null,
  };
}