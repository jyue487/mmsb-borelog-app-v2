import { SoilProperties } from "@/src/interfaces/SoilProperties";

export function deserializeSoilProperties(soilProperties: any): SoilProperties {
  return {
    dominantSoilType: soilProperties.dominantSoilType,
    customDominantSoilType: soilProperties.customDominantSoilType,
    secondarySoilType: soilProperties.secondarySoilType,
    soilCode: soilProperties.soilCode,
    otherProperties: soilProperties.otherProperties,
    customOtherProperties: soilProperties.customOtherProperties,
  };
}