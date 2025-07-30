import { CUSTOM_OTHER_PROPERTIES_FOR_SOIL } from "@/constants/soil";
import { SoilProperties } from "@/interfaces/SoilProperties";
import { throwError } from "../error/throwError";

export function checkAndReturnSoilPropertiesDescription({
    dominantSoilType,
    secondarySoilType,
    otherProperties,
    customOtherProperties,
}: SoilProperties): string {
    if (!dominantSoilType) {
        throwError(`Error: Dominant Soil Type`);
    }

    let description: string = '';

    if (!secondarySoilType) {
        description += `${dominantSoilType}`;
    } else {
        description += `${secondarySoilType} ${dominantSoilType}`;
    }
    if (otherProperties === CUSTOM_OTHER_PROPERTIES_FOR_SOIL) {
        if (customOtherProperties.trim().length === 0) {
            throwError(`Error: Custom Other Properties`);
        }
        description += ` ${customOtherProperties}`;
    } else {
        description += ` ${otherProperties}`;
    }
    
    return description;
}