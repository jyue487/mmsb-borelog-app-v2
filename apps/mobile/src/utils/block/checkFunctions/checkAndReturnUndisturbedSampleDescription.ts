import { ColourProperties } from "@/src/interfaces/ColourProperties";
import { SoilProperties } from "@/src/interfaces/SoilProperties";
import { capitalizeFirstChar } from "@/src/utils/string";
import { checkAndReturnColourPropertiesDescription } from "./checkAndReturnColourPropertiesDescription";
import { checkAndReturnSoilPropertiesDescription } from "./checkAndReturnSoilPropertiesDescription";

type Params = {
  recoveryLengthInMetres: number;
  topColourProperties: ColourProperties;
  topSoilProperties: SoilProperties;
  baseDitto: boolean;
  bottomColourProperties: ColourProperties;
  bottomSoilProperties: SoilProperties;
};

export function checkAndReturnUndisturbedSampleDescription({
  recoveryLengthInMetres,
  topColourProperties,
  topSoilProperties,
  baseDitto,
  bottomColourProperties,
  bottomSoilProperties,
}: Params): string {

  if (recoveryLengthInMetres === 0) {
    return 'No recovery';
  }
  const topColourPropertiesDescription: string = checkAndReturnColourPropertiesDescription(topColourProperties);
  const topSoilPropertiesDescription: string = checkAndReturnSoilPropertiesDescription(topSoilProperties);
  const topDescription: string = `${topColourPropertiesDescription} ${topSoilPropertiesDescription}`;
  if (baseDitto) {
    return `Top and Bottom: ${capitalizeFirstChar(topDescription)}`;
  }
  const bottomColourPropertiesDescription: string = checkAndReturnColourPropertiesDescription(bottomColourProperties);
  const bottomSoilPropertiesDescription: string = checkAndReturnSoilPropertiesDescription(bottomSoilProperties);
  const bottomDescription: string = `${bottomColourPropertiesDescription} ${bottomSoilPropertiesDescription}`;

  return `Top: ${capitalizeFirstChar(topDescription)}; Bottom: ${capitalizeFirstChar(bottomDescription)}`;
}