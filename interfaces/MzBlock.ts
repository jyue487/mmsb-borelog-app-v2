import { MZ_BLOCK_TYPE_ID } from '@/constants/BlockTypeId';
import { DayWorkStatus } from '@/constants/DayStatus';

export interface MzBlock {
    blockId: number;
    readonly blockTypeId: typeof MZ_BLOCK_TYPE_ID;
    blockType: 'Mz';
    mazierSampleIndex: number;
    dayWorkStatus: DayWorkStatus;
    topDepthInMetres: number;
    baseDepthInMetres: number;
    topSoilDescription: string;
    baseSoilDescription: string;
    recoveryLengthInMetres: number;
}