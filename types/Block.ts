import { SptBlock } from './SptBlock';
import { UdBlock } from './UdBlock';

export interface BlockTypes {
  Spt: SptBlock;
  Ud: UdBlock;
  // add more here
}

export interface BaseBlock {
    id: number;
    name: string;
}

export type Block<K extends keyof BlockTypes = keyof BlockTypes> = BaseBlock & BlockTypes[K];