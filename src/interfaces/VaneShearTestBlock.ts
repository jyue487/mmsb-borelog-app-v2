import { createDefaultDayWorkStatus, DayWorkStatus } from '@/src/constants/DayWorkStatus';
import { VANE_SHEAR_TEST_SYMBOL } from '@/src/constants/symbol';
import { BaseBlock, VANE_SHEAR_TEST_BLOCK_TYPE_ID } from '@/src/interfaces/Block';

export interface VaneShearTestBlock {
    blockTypeId: typeof VANE_SHEAR_TEST_BLOCK_TYPE_ID;
    symbol: typeof VANE_SHEAR_TEST_SYMBOL;
    vaneShearTestIndex: number;
    dayWorkStatus: DayWorkStatus;
    topDepthInMetres: number;
    baseDepthInMetres: number;
    readonly description: 'Vane Shear Test';
}

export function createDefaultVaneShearTestBlock(): BaseBlock & VaneShearTestBlock {
  return {
    id: '',
    boreholeId: '',
    blockTypeId: VANE_SHEAR_TEST_BLOCK_TYPE_ID,
    symbol: VANE_SHEAR_TEST_SYMBOL,
    vaneShearTestIndex: -1,
    dayWorkStatus: createDefaultDayWorkStatus(),
    topDepthInMetres: -1,
    baseDepthInMetres: -1,
    description: 'Vane Shear Test',
    createdAt: new Date(),
    updatedAt: null,
  };
}