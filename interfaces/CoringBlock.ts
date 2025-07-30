import { DayWorkStatus } from '@/constants/DayWorkStatus';
import { CORING_BLOCK_TYPE_ID } from '@/interfaces/Block';
import { ColourProperties } from './ColourProperties';
import { RockProperties } from './RockProperties';

export interface CoringBlock {
    id: number;
    blockTypeId: typeof CORING_BLOCK_TYPE_ID;
    rockSampleIndex: number;
    dayWorkStatus: DayWorkStatus;
    topDepthInMetres: number;
    baseDepthInMetres: number;
    description: string;
    coreRunInMetres: number;
    coreRecoveryInPercentage: number;
    rqdInPercentage: number;
    coreRecoveryInMetres: number;
    rqdInMetres: number;
    colourProperties: ColourProperties;
    rockProperties: RockProperties;
}