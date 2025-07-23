import { MzBlock } from '@/interfaces/MzBlock';
import { PsBlock } from '@/interfaces/PsBlock';
import { SptBlock } from '@/interfaces/SptBlock';
import { UdBlock } from '@/interfaces/UdBlock';
import { CavityBlock } from '@/interfaces/CavityBlock';
import { CoringBlock } from '@/interfaces/CoringBlock';

export interface Blocks {
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

export type Block<K extends keyof Blocks = keyof Blocks> = BaseBlock & Blocks[K];
