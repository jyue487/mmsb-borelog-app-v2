import { PS_BLOCK_TYPE_ID } from '@/constants/BlockTypeId';
import { DayWorkStatus } from '@/constants/DayStatus';
import { Colour } from '@/constants/colour';
import { DominantSoilType, SecondarySoilType } from '@/constants/soil';
import { PS_BLOCK_TYPE } from '@/interfaces/Block';

export interface PsBlock {
    blockId: number;
    readonly blockTypeId: typeof PS_BLOCK_TYPE_ID;
    blockType: typeof PS_BLOCK_TYPE;
    pistonSampleIndex: number;
    dayWorkStatus: DayWorkStatus;
    topDepthInMetres: number;
    baseDepthInMetres: number;
    soilDescription: string;
    recoveryInPercentage: number;
    penetrationDepthInMetres: number;
    topDominantColour: Colour | null;
    topSecondaryColour: Colour | null;
    topDominantSoilType: DominantSoilType | null;
    topSecondarySoilType: SecondarySoilType | null;
    topOtherProperties: string;
    baseDitto: boolean;
    isSelectBaseDittoPressed: boolean;
    baseDominantColour: Colour | null;
    baseSecondaryColour: Colour | null;
    baseDominantSoilType: DominantSoilType | null;
    baseSecondarySoilType: SecondarySoilType | null;
    baseOtherProperties: string;
    recoveryLengthInMetres: number;
}