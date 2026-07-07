import { Colour } from "@/constants/colour";

export interface ColourProperties {
	dominantColour: Colour | null;
	secondaryColour: Colour | null;
}

export function createDefaultColourProperties(): ColourProperties {
	return {
		dominantColour: null,
		secondaryColour: null,
	};
}