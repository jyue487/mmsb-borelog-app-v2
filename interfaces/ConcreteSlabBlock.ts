import { DayWorkStatus } from '@/constants/DayStatus';
import { CONCRETE_SLAB_BLOCK_TYPE_ID } from '@/interfaces/Block';

export interface ConcreteSlabBlock {
    blockId: number;
    blockTypeId: typeof CONCRETE_SLAB_BLOCK_TYPE_ID;
    dayWorkStatus: DayWorkStatus;
    topDepthInMetres: number;
    baseDepthInMetres: number;
    readonly description: 'Concrete Slab';
}