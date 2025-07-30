import { Colour } from "@/constants/colour";
import { DominantSoilType, SecondarySoilType } from "@/constants/soil";
import { checkAndReturnColourPropertiesDescription } from "./checkAndReturnColourPropertiesDescription";
import { ColourProperties } from "@/interfaces/ColourProperties";
import { SoilProperties } from "@/interfaces/SoilProperties";
import { checkAndReturnSoilPropertiesDescription } from "./checkAndReturnSoilPropertiesDescription";
import { capitalizeFirstChar } from "../string";

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