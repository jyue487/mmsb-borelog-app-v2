import { DayWorkStatus } from '@/constants/DayWorkStatus';
import { CONSTANT_HEAD_PERMEABILITY_TEST_SYMBOL } from '@/constants/symbol';
import { CONSTANT_HEAD_PERMEABILITY_TEST_BLOCK_TYPE_ID } from '@/interfaces/Block';

export interface ConstantHeadPermeabilityTestBlock {
    blockTypeId: typeof CONSTANT_HEAD_PERMEABILITY_TEST_BLOCK_TYPE_ID;
    symbol: typeof CONSTANT_HEAD_PERMEABILITY_TEST_SYMBOL;
    permeabilityTestIndex: number;
    dayWorkStatus: DayWorkStatus;
    topDepthInMetres: number;
    baseDepthInMetres: number;
    readonly description: 'Constant Head Permeability Test';
}