import { UD_BLOCK_TYPE_ID } from '@/constants/BlockTypeId';
import { DayWorkStatus } from '@/constants/DayStatus';

export interface UdBlock {
    blockId: number;
    readonly blockTypeId: typeof UD_BLOCK_TYPE_ID;
    blockType: 'Ud';
    undisturbedSampleIndex: number;
    dayWorkStatus: DayWorkStatus;
    topDepthInMetres: number;
    baseDepthInMetres: number;
    topSoilDescription: string;
    baseSoilDescription: string;
    recoveryLengthInMetres: number;
}