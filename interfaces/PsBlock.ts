import { DayWorkStatus } from '@/constants/DayWorkStatus';
import { PS_BLOCK_TYPE_ID } from '@/interfaces/Block';
import { ColourProperties } from './ColourProperties';
import { SoilProperties } from './SoilProperties';

export interface PsBlock {
    id: number;
    blockTypeId: typeof PS_BLOCK_TYPE_ID;
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