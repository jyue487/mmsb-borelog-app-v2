import { createDefaultDayWorkStatus, DayWorkStatus } from '@/constants/DayWorkStatus';
import { PRESSUREMETER_TEST_SYMBOL } from '@/constants/symbol';
import { BaseBlock, PRESSUREMETER_TEST_BLOCK_TYPE_ID } from '@/interfaces/Block';

export interface PressuremeterTestBlock {
    blockTypeId: typeof PRESSUREMETER_TEST_BLOCK_TYPE_ID;
    symbol: typeof PRESSUREMETER_TEST_SYMBOL;
    pressuremeterTestIndex: number;
    dayWorkStatus: DayWorkStatus;
    topDepthInMetres: number;
    baseDepthInMetres: number;
    description: 'Pressuremeter Test';
}

export function createDefaultPressuremeterTestBlock(): BaseBlock & PressuremeterTestBlock {
  return {
    id: '',
    boreholeId: '',
    blockTypeId: PRESSUREMETER_TEST_BLOCK_TYPE_ID,
    symbol: PRESSUREMETER_TEST_SYMBOL,
    pressuremeterTestIndex: -1,
    dayWorkStatus: createDefaultDayWorkStatus(),
    topDepthInMetres: -1,
    baseDepthInMetres: -1,
    description: 'Pressuremeter Test',
    createdAt: new Date(),
    updatedAt: null,
  };
}