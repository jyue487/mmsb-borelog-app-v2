import { PS_BLOCK_TYPE_ID } from '@/constants/BlockTypeId';
import { DayWorkStatus } from '@/constants/DayStatus';

export interface PsBlock {
    blockId: number;
    readonly blockTypeId: typeof PS_BLOCK_TYPE_ID;
    blockType: 'Ps';
    pistonSampleIndex: number;
    dayWorkStatus: DayWorkStatus;
    topDepthInMetres: number;
    baseDepthInMetres: number;
    topSoilDescription: string;
    baseSoilDescription: string;
    recoveryLengthInMetres: number;
}