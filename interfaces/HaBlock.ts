import { HA_BLOCK_TYPE_ID } from '@/constants/BlockTypeId';
import { Colour } from '@/constants/colour';
import { DayWorkStatus } from '@/constants/DayStatus';
import { DominantSoilType, SecondarySoilType } from '@/constants/soil';
import { HA_BLOCK_TYPE } from '@/interfaces/Block';

export interface HaBlock {
    blockId: number;
    readonly blockTypeId: typeof HA_BLOCK_TYPE_ID;
    blockType: typeof HA_BLOCK_TYPE;
    haSampleIndex: number;
    dayWorkStatus: DayWorkStatus;
    topDepthInMetres: number;
    baseDepthInMetres: number;
    description: string;
    requireSample: boolean;
    dominantColour: Colour | null;
    secondaryColour: Colour | null;
    dominantSoilType: DominantSoilType | null;
    secondarySoilType: SecondarySoilType | null;
    otherProperties: string;
}