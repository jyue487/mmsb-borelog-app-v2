import { DominantSoilType, SecondarySoilType } from "@/constants/soil";

export interface SoilProperties {
    dominantSoilType: DominantSoilType | null;
    secondarySoilType: SecondarySoilType | null;
    soilCode: number | null;
    otherProperties: string;
    customOtherProperties: string;
}

export function createDefaultSoilProperties(): SoilProperties {
    return {
        dominantSoilType: null,
        secondarySoilType: null,
        soilCode: null,
        otherProperties: '',
        customOtherProperties: '',
    };
}