import { MZ_BLOCK_TYPE_ID } from '@/constants/BlockTypeId';

export interface MzBlock {
    blockId: number;
    readonly blockTypeId: typeof MZ_BLOCK_TYPE_ID;
    blockType: 'Mz';
    mazierSampleIndex: number;
    topDepthInMetres: number;
    baseDepthInMetres: number;
    topSoilDescription: string;
    baseSoilDescription: string;
    recoveryLengthInMetres: number;
}