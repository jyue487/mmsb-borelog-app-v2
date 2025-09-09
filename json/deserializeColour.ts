import { Colour } from "@/constants/colour";

export function deserializeColour(colour: any): Colour | null {
    if (colour === null) {
        return null;
    }
    return {
        level: colour.level,
        colourTag: colour.colourTag,
        colourTagFontColour: colour.colourTagFontColour,
        colourNameForSoilDescription: colour.colourNameForSoilDescription,
        colourCode: colour.colourCode,
        colourFamily: colour.colourFamily,
    };
}