import { DominantSoilType, SecondarySoilType } from "@/constants/soil";

export interface SoilProperties {
    dominantSoilType: DominantSoilType | null;
    secondarySoilType: SecondarySoilType | null;
    otherProperties: string;
    customOtherProperties: string;
}