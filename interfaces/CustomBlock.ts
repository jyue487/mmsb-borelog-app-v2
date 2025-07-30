import { DayWorkStatus } from '@/constants/DayWorkStatus';
import { CUSTOM_BLOCK_TYPE_ID } from '@/interfaces/Block';

export interface CustomBlock {
    id: number;
    blockTypeId: typeof CUSTOM_BLOCK_TYPE_ID;
    dayWorkStatus: DayWorkStatus;
    topDepthInMetres: number;
    baseDepthInMetres: number;
    description: string;
}