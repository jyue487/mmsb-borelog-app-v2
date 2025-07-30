import { ColourProperties } from "@/interfaces/ColourProperties";
import { throwError } from "../error/throwError";

export function checkAndReturnColourPropertiesDescription({
    dominantColour,
    secondaryColour
}: ColourProperties): string {
    if (!dominantColour) {
        throwError(`Error: Dominant Colour`);
    }

    let description: string = '';

    const totalColourLevel = dominantColour.level;
    if (totalColourLevel <= 1) {
        description += 'dark';
    } else if (totalColourLevel <= 2) {
        description += 'medium';
    } else if (totalColourLevel <= 3) {
        description += 'light';
    } else {
        description += 'pale';
    }

    if (!secondaryColour) {
        description += ` ${dominantColour.colourNameForSoilDescription}`;
    } else {
        description += ` ${secondaryColour.colourNameForSoilDescription} ${dominantColour.colourNameForSoilDescription}`;
    }
    
    return description;
}