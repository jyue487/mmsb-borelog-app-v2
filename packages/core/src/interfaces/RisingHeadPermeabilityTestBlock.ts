import { createDefaultDayWorkStatus, type DayWorkStatus } from '../constants/DayWorkStatus';
import { RISING_HEAD_PERMEABILITY_TEST_SYMBOL } from '../constants/symbol';
import { type BaseBlock, RISING_HEAD_PERMEABILITY_TEST_BLOCK_TYPE_ID } from './Block';

export interface RisingHeadPermeabilityTestBlock {
  blockTypeId: typeof RISING_HEAD_PERMEABILITY_TEST_BLOCK_TYPE_ID;
  symbol: typeof RISING_HEAD_PERMEABILITY_TEST_SYMBOL;
  permeabilityTestIndex: number;
  dayWorkStatus: DayWorkStatus;
  topDepthInMetres: number;
  baseDepthInMetres: number;
  readonly description: 'Rising Head Permeability Test';
}

export function createDefaultRisingHeadPermeabilityTestBlock(): BaseBlock & RisingHeadPermeabilityTestBlock {
  return {
    id: '',
    boreholeId: '',
    blockTypeId: RISING_HEAD_PERMEABILITY_TEST_BLOCK_TYPE_ID,
    symbol: RISING_HEAD_PERMEABILITY_TEST_SYMBOL,
    permeabilityTestIndex: -1,
    dayWorkStatus: createDefaultDayWorkStatus(),
    topDepthInMetres: -1,
    baseDepthInMetres: -1,
    description: 'Rising Head Permeability Test',
    createdAt: new Date(),
    updatedAt: null,
  };
}