import { createDefaultDayWorkStatus, DayWorkStatus } from '@/constants/DayWorkStatus';
import { LUGEON_TEST_SYMBOL } from '@/constants/symbol';
import { BaseBlock, LUGEON_TEST_BLOCK_TYPE_ID } from '@/interfaces/Block';

export interface LugeonTestBlock {
    blockTypeId: typeof LUGEON_TEST_BLOCK_TYPE_ID;
    symbol: typeof LUGEON_TEST_SYMBOL;
    lugeonTestIndex: number;
    dayWorkStatus: DayWorkStatus;
    topDepthInMetres: number;
    baseDepthInMetres: number;
    description: 'Lugeon Test';
}

export function createDefaultLugeonTestBlock(): BaseBlock & LugeonTestBlock {
  return {
    id: '',
    boreholeId: '',
    blockTypeId: LUGEON_TEST_BLOCK_TYPE_ID,
    symbol: LUGEON_TEST_SYMBOL,
    lugeonTestIndex: -1,
    dayWorkStatus: createDefaultDayWorkStatus(),
    topDepthInMetres: -1,
    baseDepthInMetres: -1,
    description: 'Lugeon Test',
    createdAt: new Date(),
    updatedAt: null,
  };
}