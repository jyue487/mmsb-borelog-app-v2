import { DayWorkStatus } from '@/constants/DayWorkStatus';
import { ASPHALT_BLOCK_TYPE_ID } from '@/interfaces/Block';

export interface AsphaltBlock {
    id: number;
    blockTypeId: typeof ASPHALT_BLOCK_TYPE_ID;
    dayWorkStatus: DayWorkStatus;
    topDepthInMetres: number;
    baseDepthInMetres: number;
    readonly description: 'Asphalt, Tar, Bituminous Material';
}