import { DayWorkStatus } from '@/constants/DayWorkStatus';
import { FALLING_HEAD_PERMEABILITY_TEST_SYMBOL } from '@/constants/symbol';
import { FALLING_HEAD_PERMEABILITY_TEST_BLOCK_TYPE_ID } from '@/interfaces/Block';

export interface FallingHeadPermeabilityTestBlock {
    id: number;
    blockTypeId: typeof FALLING_HEAD_PERMEABILITY_TEST_BLOCK_TYPE_ID;
    symbol: typeof FALLING_HEAD_PERMEABILITY_TEST_SYMBOL;
    permeabilityTestIndex: number;
    dayWorkStatus: DayWorkStatus;
    topDepthInMetres: number;
    baseDepthInMetres: number;
    readonly description: 'Falling Head Permeability Test';
}