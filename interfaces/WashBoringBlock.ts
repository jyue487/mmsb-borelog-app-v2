import { WASH_BORING_BLOCK_TYPE_ID } from '@/constants/BlockTypeId';
import { DayWorkStatus } from '@/constants/DayStatus';
import { WASH_BORING_BLOCK_TYPE } from '@/interfaces/Block';

export interface WashBoringBlock {
    blockId: number;
    readonly blockTypeId: typeof WASH_BORING_BLOCK_TYPE_ID;
    blockType: typeof WASH_BORING_BLOCK_TYPE;
    dayWorkStatus: DayWorkStatus;
    topDepthInMetres: number;
    baseDepthInMetres: number;
    readonly description: 'Wash Boring';
}