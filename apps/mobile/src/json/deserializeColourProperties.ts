import { ColourProperties } from "@/src/interfaces/ColourProperties";
import { deserializeColour } from "./deserializeColour";

export function deserializeColourProperties(colourProperties: any): ColourProperties {
    return {
        dominantColour: deserializeColour(colourProperties.dominantColour),
        secondaryColour: deserializeColour(colourProperties.secondaryColour),
    };
}