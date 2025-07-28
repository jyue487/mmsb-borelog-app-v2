import { DayWorkStatus } from '@/constants/DayStatus';
import { WASH_BORING_BLOCK_TYPE_ID } from '@/interfaces/Block';

export interface WashBoringBlock {
    id: number;
    blockTypeId: typeof WASH_BORING_BLOCK_TYPE_ID;
    dayWorkStatus: DayWorkStatus;
    topDepthInMetres: number;
    baseDepthInMetres: number;
    readonly description: 'Wash Boring';
}