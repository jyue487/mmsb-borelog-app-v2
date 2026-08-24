import { createDefaultDayWorkStatus, type DayWorkStatus } from '../constants/DayWorkStatus';
import { type BaseBlock, WASH_BORING_BLOCK_TYPE_ID } from './Block';

export interface WashBoringBlock {
  blockTypeId: typeof WASH_BORING_BLOCK_TYPE_ID;
  dayWorkStatus: DayWorkStatus;
  topDepthInMetres: number;
  baseDepthInMetres: number;
  readonly description: 'Wash Boring';
}

export function createDefaultWashBoringBlock(): BaseBlock & WashBoringBlock {
  return {
    id: '',
    boreholeId: '',
    blockTypeId: WASH_BORING_BLOCK_TYPE_ID,
    dayWorkStatus: createDefaultDayWorkStatus(),
    topDepthInMetres: -1,
    baseDepthInMetres: -1,
    description: 'Wash Boring',
    createdAt: new Date(),
    updatedAt: null,
  };
}