import { DayWorkStatus } from '@/constants/DayWorkStatus';
import { HA_BLOCK_TYPE_ID } from '@/interfaces/Block';
import { ColourProperties } from './ColourProperties';
import { SoilProperties } from './SoilProperties';

export interface HaBlock {
    id: number;
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