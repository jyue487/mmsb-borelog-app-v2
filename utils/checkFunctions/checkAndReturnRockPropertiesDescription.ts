import { RockProperties } from "@/interfaces/RockProperties";
import { throwError } from "../error/throwError";

export function checkAndReturnRockPropertiesDescription({
  rockType,
  otherRockType,
  otherProperties,
}: RockProperties) {

    if (!rockType) {
        throwError('Error: Rock Type');
    }

    let description: string = '';
    if (rockType === 'OTHERS') {
        if (!otherRockType.trim()) {
            throwError('Error: Other Rock Type');
        }
        description += `${otherRockType.trim()}`;
    } else {
        description += `${rockType}`;
    }

    if (otherProperties.length > 0) {
        description += ` ${otherProperties}`;
    }
    
    return description;
}