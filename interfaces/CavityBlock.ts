import { CAVITY_BLOCK_TYPE_ID } from '@/constants/BlockTypeId';
import { DayWorkStatus } from '@/constants/DayStatus';
import { CAVITY_BLOCK_TYPE } from '@/interfaces/Block';

export interface CavityBlock {
    blockId: number;
    readonly blockTypeId: typeof CAVITY_BLOCK_TYPE_ID;
    blockType: typeof CAVITY_BLOCK_TYPE;
    dayWorkStatus: DayWorkStatus;
    topDepthInMetres: number;
    baseDepthInMetres: number;
    cavityDescription: string;
}