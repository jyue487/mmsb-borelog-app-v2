import { UD_BLOCK_TYPE_ID } from '@/constants/BlockTypeId';

export interface UdBlock {
    blockId: number;
    readonly blockTypeId: typeof UD_BLOCK_TYPE_ID;
    blockType: 'Ud';
    undisturbedSampleIndex: number;
    topDepthInMetres: number;
    baseDepthInMetres: number;
    topSoilDescription: string;
    baseSoilDescription: string;
    recoveryLengthInMetres: number;
}