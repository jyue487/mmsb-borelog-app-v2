import { Colour } from '@/constants/colour';
import { DayWorkStatus } from '@/constants/DayStatus';
import { RockType } from '@/constants/rock';
import { CORING_BLOCK_TYPE_ID } from '@/interfaces/Block';

export interface CoringBlock {
    id: number;
    blockTypeId: typeof CORING_BLOCK_TYPE_ID;
    rockSampleIndex: number;
    dayWorkStatus: DayWorkStatus;
    topDepthInMetres: number;
    baseDepthInMetres: number;
    rockDescription: string;
    coreRunInMetres: number;
    coreRecoveryInPercentage: number;
    rqdInPercentage: number;
    coreRecoveryInMetres: number;
    rqdInMetres: number;
    dominantColour: Colour | null;
    secondaryColour: Colour | null;
    rockType: RockType | null;
    otherRockType: string;
    otherProperties: string;
}