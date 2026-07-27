import { CUSTOM, CUSTOM_OTHER_PROPERTIES_FOR_SOIL } from "@/src/constants/soil";
import { SoilProperties } from "@/src/interfaces/SoilProperties";
import { throwError } from "@/src/utils/error/throwError";

export function checkAndReturnSoilPropertiesDescription({
  dominantSoilType,
  customDominantSoilType,
  secondarySoilType,
  otherProperties,
  customOtherProperties,
}: SoilProperties): string {
  if (!dominantSoilType) {
    throwError(`Error: Dominant Soil Type`);
  }

  let description: string = '';

  if (dominantSoilType === CUSTOM) {
    description += `${customDominantSoilType}`
  } else {
    if (!secondarySoilType) {
      description += `${dominantSoilType}`;
    } else {
      description += `${secondarySoilType} ${dominantSoilType}`;
    }
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