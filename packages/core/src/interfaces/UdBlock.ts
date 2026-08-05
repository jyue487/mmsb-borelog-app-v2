import { createDefaultDayWorkStatus, DayWorkStatus } from '../constants/DayWorkStatus';
import { BaseBlock, UD_BLOCK_TYPE_ID } from './Block';
import { ColourProperties, createDefaultColourProperties } from './ColourProperties';
import { createDefaultSoilProperties, SoilProperties } from './SoilProperties';

export interface UdBlock {
  blockTypeId: typeof UD_BLOCK_TYPE_ID;
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

export function createDefaultUdBlock(): BaseBlock & UdBlock {
  return {
    id: '',
    boreholeId: '',
    blockTypeId: UD_BLOCK_TYPE_ID,
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