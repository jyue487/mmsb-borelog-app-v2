import { ColourProperties } from "@/interfaces/ColourProperties";
import { SoilProperties } from "@/interfaces/SoilProperties";
import { checkAndReturnColourPropertiesDescription } from "./checkAndReturnColourPropertiesDescription";
import { checkAndReturnSoilPropertiesDescription } from "./checkAndReturnSoilPropertiesDescription";
import { SoilPropertiesInputQuestions } from "@/components/inputQuestions/SoilPropertiesInputQuestions";
import { capitalizeFirstChar } from "../string";

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