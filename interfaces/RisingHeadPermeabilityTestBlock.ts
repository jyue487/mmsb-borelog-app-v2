import { DayWorkStatus } from '@/constants/DayWorkStatus';
import { RISING_HEAD_PERMEABILITY_TEST_SYMBOL } from '@/constants/symbol';
import { RISING_HEAD_PERMEABILITY_TEST_BLOCK_TYPE_ID } from '@/interfaces/Block';

export interface RisingHeadPermeabilityTestBlock {
    blockTypeId: typeof RISING_HEAD_PERMEABILITY_TEST_BLOCK_TYPE_ID;
    symbol: typeof RISING_HEAD_PERMEABILITY_TEST_SYMBOL;
    permeabilityTestIndex: number;
    dayWorkStatus: DayWorkStatus;
    topDepthInMetres: number;
    baseDepthInMetres: number;
    readonly description: 'Rising Head Permeability Test';
}