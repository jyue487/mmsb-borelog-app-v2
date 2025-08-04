import { DayWorkStatus } from '@/constants/DayWorkStatus';
import { LUGEON_TEST_SYMBOL } from '@/constants/symbol';
import { LUGEON_TEST_BLOCK_TYPE_ID } from '@/interfaces/Block';

export interface LugeonTestBlock {
    id: number;
    blockTypeId: typeof LUGEON_TEST_BLOCK_TYPE_ID;
    symbol: typeof LUGEON_TEST_SYMBOL;
    lugeonTestIndex: number;
    dayWorkStatus: DayWorkStatus;
    topDepthInMetres: number;
    baseDepthInMetres: number;
    description: 'Lugeon Test';
}