import { SptBlock } from '@/types/SptBlock';
import { CoringBlock } from './CoringBlock';
import { CavityBlock } from './CavityBlock';
import { UdBlock } from '@/types/UdBlock';

export interface BlockTypes {
  Spt: SptBlock;
  Coring: CoringBlock;
  Cavity: CavityBlock;
  Ud: UdBlock;
}

export interface BaseBlock {
  id: number;
  blockTypeId: number;
  boreholeId: number;
}

export type Block<K extends keyof BlockTypes = keyof BlockTypes> = BaseBlock & BlockTypes[K];
