import { DayWorkStatus } from '@/constants/DayWorkStatus';
import { CONCRETE_PREMIX_BLOCK_TYPE_ID } from '@/interfaces/Block';

export interface ConcretePremixBlock {
    id: number;
    blockTypeId: typeof CONCRETE_PREMIX_BLOCK_TYPE_ID;
    dayWorkStatus: DayWorkStatus;
    topDepthInMetres: number;
    baseDepthInMetres: number;
    readonly description: 'Concrete Premix';
}