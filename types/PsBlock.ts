import { PS_BLOCK_TYPE_ID } from '@/constants/BlockTypeId';

export interface PsBlock {
    blockId: number;
    readonly blockTypeId: typeof PS_BLOCK_TYPE_ID;
    blockType: 'Ps';
    pistonSampleIndex: number;
    topDepthInMetres: number;
    baseDepthInMetres: number;
    topSoilDescription: string;
    baseSoilDescription: string;
    recoveryLengthInMetres: number;
}