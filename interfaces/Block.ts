import { CavityBlock } from '@/interfaces/CavityBlock';
import { ConcretePremixBlock } from '@/interfaces/ConcretePremixBlock';
import { ConcreteSlabBlock } from '@/interfaces/ConcreteSlabBlock';
import { CoringBlock } from '@/interfaces/CoringBlock';
import { EndOfBoreholeBlock } from '@/interfaces/EndOfBoreholeBlock';
import { HaBlock } from '@/interfaces/HaBlock';
import { MzBlock } from '@/interfaces/MzBlock';
import { PsBlock } from '@/interfaces/PsBlock';
import { SptBlock } from '@/interfaces/SptBlock';
import { UdBlock } from '@/interfaces/UdBlock';
import { WashBoringBlock } from '@/interfaces/WashBoringBlock';
import { CustomBlock } from '@/interfaces/CustomBlock';
import { VaneShearTestBlock } from '@/interfaces/VaneShearTestBlock';
import { FallingHeadPermeabilityTestBlock } from './FallingHeadPermeabilityTestBlock';
import { RisingHeadPermeabilityTestBlock } from './RisingHeadPermeabilityTestBlock';
import { ConstantHeadPermeabilityTestBlock } from './ConstantHeadPermeabilityTestBlock';
import { LugeonTestBlock } from './LugeonTestBlock';
import { PressuremeterTestBlock } from './PressuremeterTestBlock';

export const SPT_BLOCK_TYPE_ID = 1 as const;
export const CORING_BLOCK_TYPE_ID = 2 as const;
export const CAVITY_BLOCK_TYPE_ID = 3 as const;
export const UD_BLOCK_TYPE_ID = 4 as const;
export const MZ_BLOCK_TYPE_ID = 5 as const;
export const PS_BLOCK_TYPE_ID = 6 as const;
export const HA_BLOCK_TYPE_ID = 7 as const;
export const WASH_BORING_BLOCK_TYPE_ID = 8 as const;
export const CONCRETE_SLAB_BLOCK_TYPE_ID = 9 as const;
export const CONCRETE_PREMIX_BLOCK_TYPE_ID = 10 as const;
export const END_OF_BOREHOLE_BLOCK_TYPE_ID = 11 as const;
export const CUSTOM_BLOCK_TYPE_ID = 12 as const;
export const VANE_SHEAR_TEST_BLOCK_TYPE_ID = 13 as const;
export const FALLING_HEAD_PERMEABILITY_TEST_BLOCK_TYPE_ID = 14 as const;
export const RISING_HEAD_PERMEABILITY_TEST_BLOCK_TYPE_ID = 15 as const;
export const CONSTANT_HEAD_PERMEABILITY_TEST_BLOCK_TYPE_ID = 16 as const;
export const LUGEON_TEST_BLOCK_TYPE_ID = 17 as const;
export const PRESSUREMETER_TEST_BLOCK_TYPE_ID = 18 as const;
export const CUSTOM_TEST_BLOCK_TYPE_ID = 19 as const;

export const BLOCK_TYPE_ID_LIST = [
  SPT_BLOCK_TYPE_ID,
  CORING_BLOCK_TYPE_ID,
  CAVITY_BLOCK_TYPE_ID,
  UD_BLOCK_TYPE_ID,
  MZ_BLOCK_TYPE_ID,
  PS_BLOCK_TYPE_ID,
  HA_BLOCK_TYPE_ID,
  WASH_BORING_BLOCK_TYPE_ID,
  CONCRETE_SLAB_BLOCK_TYPE_ID,
  CONCRETE_PREMIX_BLOCK_TYPE_ID,
  END_OF_BOREHOLE_BLOCK_TYPE_ID,
  CUSTOM_BLOCK_TYPE_ID,
  VANE_SHEAR_TEST_BLOCK_TYPE_ID,
  FALLING_HEAD_PERMEABILITY_TEST_BLOCK_TYPE_ID,
  RISING_HEAD_PERMEABILITY_TEST_BLOCK_TYPE_ID,
  CONSTANT_HEAD_PERMEABILITY_TEST_BLOCK_TYPE_ID,
  LUGEON_TEST_BLOCK_TYPE_ID,
  PRESSUREMETER_TEST_BLOCK_TYPE_ID,
  CUSTOM_TEST_BLOCK_TYPE_ID,
] as const;
export type BlockTypeId = typeof BLOCK_TYPE_ID_LIST[number];

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
  Custom: CustomBlock;
  VaneShearTest: VaneShearTestBlock;
  FallingHeadPermeabilityTest: FallingHeadPermeabilityTestBlock;
  RisingHeadPermeabilityTest: RisingHeadPermeabilityTestBlock;
  ConstantHeadPermeabilityTest: ConstantHeadPermeabilityTestBlock;
  LugeonTest: LugeonTestBlock;
  PressuremeterTest: PressuremeterTestBlock;
  
}

export interface BaseBlock {
  blockId: number;
  boreholeId: number;
}

export type Block<K extends keyof Blocks = keyof Blocks> = BaseBlock & Blocks[K];
