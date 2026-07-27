import { ColourProperties } from "@/src/interfaces/ColourProperties";
import { SoilProperties } from "@/src/interfaces/SoilProperties";
import { capitalizeFirstChar } from "@/src/utils/string";
import { checkAndReturnColourPropertiesDescription } from "./checkAndReturnColourPropertiesDescription";
import { checkAndReturnSoilPropertiesDescription } from "./checkAndReturnSoilPropertiesDescription";

export function checkAndReturnHaBlockDescription(
  requireSample: boolean,
  colourProperties: ColourProperties,
  soilProperties: SoilProperties
): string {
  if (!requireSample) {
    return 'Hand Auger';
  }
  const colourPropertiesDescription: string = checkAndReturnColourPropertiesDescription(colourProperties);
  const soilPropertiesDescription: string = checkAndReturnSoilPropertiesDescription(soilProperties);
  const description: string = `${colourPropertiesDescription} ${soilPropertiesDescription}`;
  return capitalizeFirstChar(description);
}