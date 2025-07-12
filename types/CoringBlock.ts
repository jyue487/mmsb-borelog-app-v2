import { CORING_BLOCK_TYPE_ID } from '@/constants/BlockTypeId';

export interface CoringBlock {
    blockId: number;
    readonly blockTypeId: typeof CORING_BLOCK_TYPE_ID;
    blockType: 'Coring';
    topDepthInMetres: number;
    baseDepthInMetres: number;
    rockDescription: string;
    coreRunInMetres: number;
    coreRecoveryInPercentage: number;
    rqdInPercentage: number;
}