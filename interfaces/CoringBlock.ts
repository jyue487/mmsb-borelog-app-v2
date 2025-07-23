import { CORING_BLOCK_TYPE_ID } from '@/constants/BlockTypeId';
import { DayWorkStatus } from '@/constants/DayStatus';

export interface CoringBlock {
    blockId: number;
    readonly blockTypeId: typeof CORING_BLOCK_TYPE_ID;
    blockType: 'Coring';
    rockSampleIndex: number;
    dayWorkStatus: DayWorkStatus;
    topDepthInMetres: number;
    baseDepthInMetres: number;
    rockDescription: string;
    coreRunInMetres: number;
    coreRecoveryInPercentage: number;
    rqdInPercentage: number;
}