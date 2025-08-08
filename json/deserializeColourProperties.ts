import { ColourProperties } from "@/interfaces/ColourProperties";
import { deserializeColour } from "./deserializeColour";

export function deserializeColourProperties(colourProperties: any): ColourProperties {
    return {
        dominantColour: deserializeColour(colourProperties.dominantColour),
        secondaryColour: deserializeColour(colourProperties.secondaryColour),
    };
}