import { SptBlock } from '@/types/SptBlock';
import { UdBlock } from '@/types/UdBlock';
import { CoringBlock } from './CoringBlock';

export interface BlockTypes {
  Spt: SptBlock;
  Ud: UdBlock;
  Coring: CoringBlock;
}

export interface BaseBlock {
  id: number;
  block_type_id: number;
  borehole_id: number;
}

export type Block<K extends keyof BlockTypes = keyof BlockTypes> = BaseBlock & BlockTypes[K];
