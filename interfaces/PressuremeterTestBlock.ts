import { DayWorkStatus } from '@/constants/DayWorkStatus';
import { PRESSUREMETER_TEST_SYMBOL } from '@/constants/symbol';
import { PRESSUREMETER_TEST_BLOCK_TYPE_ID } from '@/interfaces/Block';

export interface PressuremeterTestBlock {
    id: number;
    blockTypeId: typeof PRESSUREMETER_TEST_BLOCK_TYPE_ID;
    symbol: typeof PRESSUREMETER_TEST_SYMBOL;
    pressuremeterTestIndex: number;
    dayWorkStatus: DayWorkStatus;
    topDepthInMetres: number;
    baseDepthInMetres: number;
    description: 'Pressuremeter Test';
}