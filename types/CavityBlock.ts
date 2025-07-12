import { CAVITY_BLOCK_TYPE_ID } from '@/constants/BlockTypeId';

export interface CavityBlock {
    blockId: number;
    readonly blockTypeId: typeof CAVITY_BLOCK_TYPE_ID;
    blockType: 'Cavity';
    topDepthInMetres: number;
    baseDepthInMetres: number;
    cavityDescription: string;
}