import { createDefaultDayWorkStatus, type DayWorkStatus } from '../constants/DayWorkStatus';
import { CONSTANT_HEAD_PERMEABILITY_TEST_SYMBOL } from '../constants/symbol';
import { type BaseBlock, CONSTANT_HEAD_PERMEABILITY_TEST_BLOCK_TYPE_ID } from './Block';

export interface ConstantHeadPermeabilityTestBlock {
    blockTypeId: typeof CONSTANT_HEAD_PERMEABILITY_TEST_BLOCK_TYPE_ID;
    symbol: typeof CONSTANT_HEAD_PERMEABILITY_TEST_SYMBOL;
    permeabilityTestIndex: number;
    dayWorkStatus: DayWorkStatus;
    topDepthInMetres: number;
    baseDepthInMetres: number;
    readonly description: 'Constant Head Permeability Test';
}

export function createDefaultConstantHeadPermeabilityTestBlock(): BaseBlock & ConstantHeadPermeabilityTestBlock {
  return {
    id: '',
    boreholeId: '',
    blockTypeId: CONSTANT_HEAD_PERMEABILITY_TEST_BLOCK_TYPE_ID,
    symbol: CONSTANT_HEAD_PERMEABILITY_TEST_SYMBOL,
    permeabilityTestIndex: -1,
    dayWorkStatus: createDefaultDayWorkStatus(),
    topDepthInMetres: -1,
    baseDepthInMetres: -1,
    description: 'Constant Head Permeability Test',
    createdAt: new Date(),
    updatedAt: null,
  };
}