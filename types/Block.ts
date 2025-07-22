import { SptBlock } from '@/types/SptBlock';
import { CoringBlock } from './CoringBlock';
import { CavityBlock } from './CavityBlock';
import { UdBlock } from '@/types/UdBlock';
import { MzBlock } from '@/types/MzBlock';
import { PsBlock } from '@/types/PsBlock';

export interface BlockTypes {
  Spt: SptBlock;
  Coring: CoringBlock;
  Cavity: CavityBlock;
  Ud: UdBlock;
  Mz: MzBlock;
  Ps: PsBlock;
}

export interface BaseBlock {
  id: number;
  blockTypeId: number;
  boreholeId: number;
}

export type Block<K extends keyof BlockTypes = keyof BlockTypes> = BaseBlock & BlockTypes[K];
