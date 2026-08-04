import { createDefaultDayWorkStatus, DayWorkStatus } from '@/src/constants/DayWorkStatus';
import { FALLING_HEAD_PERMEABILITY_TEST_SYMBOL } from '@/src/constants/symbol';
import { BaseBlock, FALLING_HEAD_PERMEABILITY_TEST_BLOCK_TYPE_ID } from '@/src/interfaces/Block';

export interface FallingHeadPermeabilityTestBlock {
  blockTypeId: typeof FALLING_HEAD_PERMEABILITY_TEST_BLOCK_TYPE_ID;
  symbol: typeof FALLING_HEAD_PERMEABILITY_TEST_SYMBOL;
  permeabilityTestIndex: number;
  dayWorkStatus: DayWorkStatus;
  topDepthInMetres: number;
  baseDepthInMetres: number;
  readonly description: 'Falling Head Permeability Test';
}

export function createDefaultFallingHeadPermeabilityTestBlock(): BaseBlock & FallingHeadPermeabilityTestBlock {
  return {
    id: '',
    boreholeId: '',
    blockTypeId: FALLING_HEAD_PERMEABILITY_TEST_BLOCK_TYPE_ID,
    symbol: FALLING_HEAD_PERMEABILITY_TEST_SYMBOL,
    permeabilityTestIndex: -1,
    dayWorkStatus: createDefaultDayWorkStatus(),
    topDepthInMetres: -1,
    baseDepthInMetres: -1,
    description: 'Falling Head Permeability Test',
    createdAt: new Date(),
    updatedAt: null,
  };
}