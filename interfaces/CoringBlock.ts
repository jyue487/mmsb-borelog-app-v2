import { CORING_BLOCK_TYPE_ID } from '@/constants/BlockTypeId';
import { Colour } from '@/constants/colour';
import { DayWorkStatus } from '@/constants/DayStatus';
import { RockType } from '@/constants/rock';
import { CORING_BLOCK_TYPE } from '@/interfaces/Block';

export interface CoringBlock {
    blockId: number;
    readonly blockTypeId: typeof CORING_BLOCK_TYPE_ID;
    blockType: typeof CORING_BLOCK_TYPE;
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