import { createDefaultDayWorkStatus, DayWorkStatus } from '@/src/constants/DayWorkStatus';
import { BaseBlock, MZ_BLOCK_TYPE_ID } from '@/src/interfaces/Block';
import { ColourProperties, createDefaultColourProperties } from './ColourProperties';
import { createDefaultSoilProperties, SoilProperties } from './SoilProperties';

export interface MzBlock {
  blockTypeId: typeof MZ_BLOCK_TYPE_ID;
  sampleIndex: number;
  dayWorkStatus: DayWorkStatus;
  topDepthInMetres: number;
  baseDepthInMetres: number;
  soilDescription: string;
  recoveryInPercentage: number;
  penetrationDepthInMetres: number;
  topColourProperties: ColourProperties;
  topSoilProperties: SoilProperties;
  baseDitto: boolean;
  bottomColourProperties: ColourProperties;
  bottomSoilProperties: SoilProperties;
  recoveryLengthInMetres: number;
}

export function createDefaultMzBlock(): BaseBlock & MzBlock {
  return {
    id: '',
    boreholeId: '',
    blockTypeId: MZ_BLOCK_TYPE_ID,
    sampleIndex: -1,
    dayWorkStatus: createDefaultDayWorkStatus(),
    topDepthInMetres: -1,
    baseDepthInMetres: -1,
    soilDescription: '',
    recoveryInPercentage: -1,
    penetrationDepthInMetres: -1,
    topColourProperties: createDefaultColourProperties(),
    topSoilProperties: createDefaultSoilProperties(),
    baseDitto: true,
    bottomColourProperties: createDefaultColourProperties(),
    bottomSoilProperties: createDefaultSoilProperties(),
    recoveryLengthInMetres: -1,
    createdAt: new Date(),
    updatedAt: null,
  };
}