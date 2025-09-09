import { DayWorkStatus } from '@/constants/DayWorkStatus';
import { CONCRETE_SLAB_BLOCK_TYPE_ID } from '@/interfaces/Block';

export interface ConcreteSlabBlock {
    blockTypeId: typeof CONCRETE_SLAB_BLOCK_TYPE_ID;
    dayWorkStatus: DayWorkStatus;
    topDepthInMetres: number;
    baseDepthInMetres: number;
    readonly description: 'Concrete Slab';
}