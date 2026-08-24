import { createDefaultDayWorkStatus, type DayWorkStatus } from '../constants/DayWorkStatus';
import { ASPHALT_BLOCK_TYPE_ID, type BaseBlock } from './Block';

export interface AsphaltBlock {
  blockTypeId: typeof ASPHALT_BLOCK_TYPE_ID;
  dayWorkStatus: DayWorkStatus;
  topDepthInMetres: number;
  baseDepthInMetres: number;
  readonly description: 'Asphalt, Tar, Bituminous Material';
}

export function createDefaultAsphaltBlock(): BaseBlock & AsphaltBlock {
  return {
    id: '',
    boreholeId: '',
    blockTypeId: ASPHALT_BLOCK_TYPE_ID,
    dayWorkStatus: createDefaultDayWorkStatus(),
    topDepthInMetres: -1,
    baseDepthInMetres: -1,
    description: 'Asphalt, Tar, Bituminous Material',
    createdAt: new Date(),
    updatedAt: null,
  };
}