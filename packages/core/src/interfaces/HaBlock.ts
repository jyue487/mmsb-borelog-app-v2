import { createDefaultDayWorkStatus, type DayWorkStatus } from '../constants/DayWorkStatus';
import { type BaseBlock, HA_BLOCK_TYPE_ID } from './Block';
import { type ColourProperties, createDefaultColourProperties } from './ColourProperties';
import { createDefaultSoilProperties, type SoilProperties } from './SoilProperties';

export interface HaBlock {
  blockTypeId: typeof HA_BLOCK_TYPE_ID;
  haSampleIndex: number;
  dayWorkStatus: DayWorkStatus;
  topDepthInMetres: number;
  baseDepthInMetres: number;
  description: string;
  requireSample: boolean;
  colourProperties: ColourProperties;
  soilProperties: SoilProperties;
}

export function createDefaultHaBlock(): BaseBlock & HaBlock {
  return {
    id: '',
    boreholeId: '',
    blockTypeId: HA_BLOCK_TYPE_ID,
    haSampleIndex: -1,
    dayWorkStatus: createDefaultDayWorkStatus(),
    topDepthInMetres: -1,
    baseDepthInMetres: -1,
    description: '',
    requireSample: false,
    colourProperties: createDefaultColourProperties(),
    soilProperties: createDefaultSoilProperties(),
    createdAt: new Date(),
    updatedAt: null,
  };
}