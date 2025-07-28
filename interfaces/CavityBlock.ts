import { DayWorkStatus } from '@/constants/DayStatus';
import { CAVITY_BLOCK_TYPE_ID } from '@/interfaces/Block';

export interface CavityBlock {
    id: number;
    blockTypeId: typeof CAVITY_BLOCK_TYPE_ID;
    dayWorkStatus: DayWorkStatus;
    topDepthInMetres: number;
    baseDepthInMetres: number;
    cavityDescription: string;
}