import { createDefaultDayWorkStatus, DayWorkStatus } from '@/constants/DayWorkStatus';
import { BaseBlock, CONCRETE_SLAB_BLOCK_TYPE_ID } from '@/interfaces/Block';

export interface ConcreteSlabBlock {
  blockTypeId: typeof CONCRETE_SLAB_BLOCK_TYPE_ID;
  dayWorkStatus: DayWorkStatus;
  topDepthInMetres: number;
  baseDepthInMetres: number;
  readonly description: 'Concrete Slab';
}

export function createDefaultConcreteSlabBlock(): BaseBlock & ConcreteSlabBlock {
  return {
    id: '',
    boreholeId: '',
    blockTypeId: CONCRETE_SLAB_BLOCK_TYPE_ID,
    dayWorkStatus: createDefaultDayWorkStatus(),
    topDepthInMetres: -1,
    baseDepthInMetres: -1,
    description: 'Concrete Slab',
    createdAt: new Date(),
    updatedAt: null,
  };
}