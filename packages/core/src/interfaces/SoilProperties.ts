import type { DominantSoilType, SecondarySoilType } from "../constants/soil";

export interface SoilProperties {
  dominantSoilType: DominantSoilType | null;
  customDominantSoilType: string;
  secondarySoilType: SecondarySoilType | null;
  soilCode: number | null;
  otherProperties: string;
  customOtherProperties: string;
}

export function createDefaultSoilProperties(): SoilProperties {
  return {
    dominantSoilType: null,
    customDominantSoilType: '',
    secondarySoilType: null,
    soilCode: null,
    otherProperties: '',
    customOtherProperties: '',
  };
}