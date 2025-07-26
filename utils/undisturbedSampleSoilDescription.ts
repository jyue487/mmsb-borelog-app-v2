import { Colour } from "@/constants/colour";
import { DominantSoilType, SecondarySoilType } from "@/constants/soil";

type Params = {
    recoveryLengthInMetres: number;
    topDominantColour: Colour | null;
    topSecondaryColour: Colour | null;
    topDominantSoilType: DominantSoilType | null;
    topSecondarySoilType: SecondarySoilType | null;
    topOtherProperties: string;
    baseDitto: boolean;
    baseDominantColour: Colour | null;
    baseSecondaryColour: Colour | null;
    baseDominantSoilType: DominantSoilType | null;
    baseSecondarySoilType: SecondarySoilType | null;
    baseOtherProperties: string;
};

export function constructUndisturbedSampleSoilDescription({
    recoveryLengthInMetres,
    topDominantColour,
    topSecondaryColour,
    topDominantSoilType,
    topSecondarySoilType,
    topOtherProperties,
    baseDitto,
    baseDominantColour,
    baseSecondaryColour,
    baseDominantSoilType,
    baseSecondarySoilType,
    baseOtherProperties,
}: Params): string | null {

    if (recoveryLengthInMetres === 0) {
        return 'No recovery';
    } 
    
    let soilDescription: string = '';
    if (!topDominantColour) {
        alert('Error: Top Dominant Colour');
        return null;
    }
    if (!topDominantSoilType) {
        alert('Error: Top Dominant Soil Type');
        return null;
    }
    if (!baseDitto) {
        if (!baseDominantColour) {
            alert('Error: Base Dominant Colour');
            return null;
        }
        if (!baseDominantSoilType) {
            alert('Error: Base Dominant Soil Type');
            return null;
        }
    }

    let topSoilDescription: string = '';

    const topTotalColourLevel = topDominantColour.level;
    if (topTotalColourLevel <= 1) {
        topSoilDescription += 'Dark';
    } else if (topTotalColourLevel <= 2) {
        topSoilDescription += 'Medium';
    } else if (topTotalColourLevel <= 3) {
        topSoilDescription += 'Light';
    } else {
        topSoilDescription += 'Pale';
    }
    if (!topSecondaryColour) {
        topSoilDescription += ` ${topDominantColour.colourNameForSoilDescription}`;
    } else {
        topSoilDescription += ` ${topSecondaryColour.colourNameForSoilDescription} ${topDominantColour.colourNameForSoilDescription}`;
    }
    if (!topSecondarySoilType) {
        topSoilDescription += ` ${topDominantSoilType}`;
    } else {
        topSoilDescription += ` ${topSecondarySoilType} ${topDominantSoilType}`;
    }
    if (topOtherProperties) {
        topSoilDescription += ` ${topOtherProperties}`;
    }

    if (baseDitto) {
        return `Top and Bottom: ${topSoilDescription}`;
    }
    
    let baseSoilDescription: string = '';
    if (!baseDominantColour) {
        alert('Error: Bottom Dominant Colour');
        return null;
    }
    if (!baseDominantSoilType) {
        alert('Error: Bottom Dominant Soil Type');
        return null;
    }

    const baseTotalColourLevel = baseDominantColour.level;
    if (baseTotalColourLevel <= 1) {
        baseSoilDescription += 'Dark';
    } else if (baseTotalColourLevel <= 2) {
        baseSoilDescription += 'Medium';
    } else if (baseTotalColourLevel <= 3) {
        baseSoilDescription += 'Light';
    } else {
        baseSoilDescription += 'Pale';
    }
    if (!baseSecondaryColour) {
        baseSoilDescription += ` ${baseDominantColour.colourNameForSoilDescription}`;
    } else {
        baseSoilDescription += ` ${baseSecondaryColour.colourNameForSoilDescription} ${baseDominantColour.colourNameForSoilDescription}`;
    }
    if (!baseSecondarySoilType) {
        baseSoilDescription += ` ${baseDominantSoilType}`;
    } else {
        baseSoilDescription += ` ${baseSecondarySoilType} ${baseDominantSoilType}`;
    }
    if (baseOtherProperties) {
        baseSoilDescription += ` ${baseOtherProperties}`;
    }

    soilDescription = `Top: ${topSoilDescription}; Bottom: ${baseSoilDescription}`;

    return soilDescription;
}