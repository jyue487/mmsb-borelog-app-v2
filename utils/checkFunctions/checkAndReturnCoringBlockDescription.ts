import { ColourProperties } from "@/interfaces/ColourProperties";
import { checkAndReturnColourPropertiesDescription } from "./checkAndReturnColourPropertiesDescription";
import { checkAndReturnRockStrengthDescription } from "./checkAndReturnRockStrengthDescription";
import { checkAndReturnWeatheringClassificationDescription } from "./checkAndReturnWeatheringClassificationDescription";
import { RockProperties } from "@/interfaces/RockProperties";
import { checkAndReturnRockPropertiesDescription } from "./checkAndReturnRockPropertiesDescription";
import { capitalizeFirstChar } from "../string";

export function checkAndReturnCoringBlockDescription(
    recovery: number,
    rqdInPercentage: number,
    colourProperties: ColourProperties,
    rockProperties: RockProperties,
): string {
    if (recovery === 0) {
        return 'No recovery';
    } 
    const rockStrengthDescription: string = checkAndReturnRockStrengthDescription(rqdInPercentage);
    const colourPropertiesDescription: string = checkAndReturnColourPropertiesDescription(colourProperties);
    const weatheringClassificationDescription: string = checkAndReturnWeatheringClassificationDescription(rqdInPercentage);
    const rockPropertiesDescription: string = checkAndReturnRockPropertiesDescription(rockProperties);
    const description: string = `${rockStrengthDescription}, ${colourPropertiesDescription} ${weatheringClassificationDescription} ${rockPropertiesDescription}`;
    return capitalizeFirstChar(description);
}