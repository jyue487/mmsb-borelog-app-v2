import { MzBlock } from '@/interfaces/MzBlock';
import { PsBlock } from '@/interfaces/PsBlock';
import { SptBlock } from '@/interfaces/SptBlock';
import { UdBlock } from '@/interfaces/UdBlock';
import { CavityBlock } from '@/interfaces/CavityBlock';
import { CoringBlock } from '@/interfaces/CoringBlock';
import { WashBoringBlock } from './WashBoringBlock';
import { HaBlock } from './HaBlock';
import { ConcreteSlabBlock } from './ConcreteSlabBlock';
import { ConcretePremixBlock } from './ConcretePremixBlock';
import { EndOfBoreholeBlock } from './EndOfBoreholeBlock';

export const SPT_BLOCK_TYPE = 'Spt' as const;
export const CORING_BLOCK_TYPE = 'Coring' as const;
export const CAVITY_BLOCK_TYPE = 'Cavity' as const;
export const UD_BLOCK_TYPE = 'Ud' as const;
export const MZ_BLOCK_TYPE = 'Mz' as const;
export const PS_BLOCK_TYPE = 'Ps' as const;
export const HA_BLOCK_TYPE = 'Ha' as const;
export const WASH_BORING_BLOCK_TYPE = 'Wash Boring' as const;
export const CONCRETE_SLAB_BLOCK_TYPE = 'Concrete Slab' as const;
export const CONCRETE_PREMIX_BLOCK_TYPE = 'Concrete Premix' as const;
export const END_OF_BOREHOLE_BLOCK_TYPE = 'End of Borehole' as const;

export const BLOCK_TYPE_LIST = [
  SPT_BLOCK_TYPE,
  CORING_BLOCK_TYPE,
  CAVITY_BLOCK_TYPE,
  UD_BLOCK_TYPE,
  MZ_BLOCK_TYPE,
  PS_BLOCK_TYPE,
  HA_BLOCK_TYPE,
  WASH_BORING_BLOCK_TYPE,
  CONCRETE_SLAB_BLOCK_TYPE,
  CONCRETE_PREMIX_BLOCK_TYPE,
  END_OF_BOREHOLE_BLOCK_TYPE,
] as const;
export type BlockType = typeof BLOCK_TYPE_LIST[number];

export interface Blocks {
  Spt: SptBlock;
  Coring: CoringBlock;
  Cavity: CavityBlock;
  Ud: UdBlock;
  Mz: MzBlock;
  Ps: PsBlock;
  Ha: HaBlock;
  WashBoring: WashBoringBlock;
  ConcreteSlab: ConcreteSlabBlock;
  ConcretePremix: ConcretePremixBlock;
  EndOfBorehole: EndOfBoreholeBlock;
}

export interface BaseBlock {
  id: number;
  boreholeId: number;
}

export type Block<K extends keyof Blocks = keyof Blocks> = BaseBlock & Blocks[K];
