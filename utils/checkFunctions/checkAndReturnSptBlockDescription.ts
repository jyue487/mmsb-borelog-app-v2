import { ColourProperties } from "@/interfaces/ColourProperties";
import { checkAndReturnSoilConsistencyDescription } from "./checkAndReturnSoilConsistencyDescription";
import { checkAndReturnColourPropertiesDescription } from "./checkAndReturnColourPropertiesDescription";
import { checkAndReturnSoilPropertiesDescription } from "./checkAndReturnSoilPropertiesDescription";
import { SoilProperties } from "@/interfaces/SoilProperties";
import { capitalizeFirstChar } from "../string";

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