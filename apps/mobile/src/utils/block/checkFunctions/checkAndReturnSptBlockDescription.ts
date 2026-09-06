import { ColourProperties, CUSTOM, SoilProperties } from '@mmsb/core';
import { capitalizeFirstChar } from "@/src/utils/string";
import { checkAndReturnColourPropertiesDescription } from "./checkAndReturnColourPropertiesDescription";
import { checkAndReturnSoilConsistencyDescription } from "./checkAndReturnSoilConsistencyDescription";
import { checkAndReturnSoilPropertiesDescription } from "./checkAndReturnSoilPropertiesDescription";

export function checkAndReturnSptBlockDescription(
  recovery: number,
  colourProperties: ColourProperties,
  soilProperties: SoilProperties,
  sptNValue: number,
): string {
  if (recovery === 0) {
    return 'No recovery';
  }
  let description: string = '';
  if (soilProperties.dominantSoilType === CUSTOM) {
    const colourPropertiesDescription: string = checkAndReturnColourPropertiesDescription(colourProperties);
    const soilPropertiesDescription: string = checkAndReturnSoilPropertiesDescription(soilProperties);
    description = `${colourPropertiesDescription} ${soilPropertiesDescription}`;
  } else {
    const soilConsistencyDescription: string = checkAndReturnSoilConsistencyDescription(soilProperties.dominantSoilType, sptNValue);
    const colourPropertiesDescription: string = checkAndReturnColourPropertiesDescription(colourProperties);
    const soilPropertiesDescription: string = checkAndReturnSoilPropertiesDescription(soilProperties);
    description = `${soilConsistencyDescription}, ${colourPropertiesDescription} ${soilPropertiesDescription}`;
  }
  return capitalizeFirstChar(description);
}