import { CONCRETE_SLAB_BLOCK_TYPE_ID } from '@/constants/BlockTypeId';
import { DayWorkStatus } from '@/constants/DayStatus';
import { CONCRETE_SLAB_BLOCK_TYPE } from '@/interfaces/Block';

export interface ConcreteSlabBlock {
    blockId: number;
    readonly blockTypeId: typeof CONCRETE_SLAB_BLOCK_TYPE_ID;
    blockType: typeof CONCRETE_SLAB_BLOCK_TYPE;
    dayWorkStatus: DayWorkStatus;
    topDepthInMetres: number;
    baseDepthInMetres: number;
    readonly description: 'Concrete Slab';
}