import { SoilProperties } from "@/interfaces/SoilProperties";

export function deserializeSoilProperties(soilProperties: any): SoilProperties {
    return {
        dominantSoilType: soilProperties.dominantSoilType,
        secondarySoilType: soilProperties.secondarySoilType,
        otherProperties: soilProperties.otherProperties,
        customOtherProperties: soilProperties.customOtherProperties,
    };
}