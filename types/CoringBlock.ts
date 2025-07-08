import { CORING_BLOCK_TYPE_ID } from '@/constants/BlockTypeId';

export interface CoringBlock {
    block_id: number;
    readonly block_type_id: typeof CORING_BLOCK_TYPE_ID;
    block_type: 'Coring';
    topDepthInMetres: number;
    baseDepthInMetres: number;
    rockDescription: string;
    coreRun: number;
    coreRecovery: number;
    rqd: number;
}