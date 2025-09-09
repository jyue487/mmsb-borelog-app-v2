import { DayWorkStatus } from '@/constants/DayWorkStatus';
import { CAVITY_BLOCK_TYPE_ID } from '@/interfaces/Block';

export interface CavityBlock {
    blockTypeId: typeof CAVITY_BLOCK_TYPE_ID;
    dayWorkStatus: DayWorkStatus;
    topDepthInMetres: number;
    baseDepthInMetres: number;
    description: string;
}