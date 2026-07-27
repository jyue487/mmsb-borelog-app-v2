import { ColourProperties } from "@/src/interfaces/ColourProperties";
import { SoilProperties } from "@/src/interfaces/SoilProperties";
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
  const soilConsistencyDescription: string = checkAndReturnSoilConsistencyDescription(soilProperties.dominantSoilType, sptNValue);
  const colourPropertiesDescription: string = checkAndReturnColourPropertiesDescription(colourProperties);
  const soilPropertiesDescription: string = checkAndReturnSoilPropertiesDescription(soilProperties);
  const description: string = `${soilConsistencyDescription}, ${colourPropertiesDescription} ${soilPropertiesDescription}`;
  return capitalizeFirstChar(description);
}