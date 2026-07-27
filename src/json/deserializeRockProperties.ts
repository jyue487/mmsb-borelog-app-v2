import { RockProperties } from "@/src/interfaces/RockProperties";

export function deserializeRockProperties(rockProperties: any): RockProperties {
    return {
        rockType: rockProperties.rockType,
        rockCode: rockProperties.rockCode,
        otherRockType: rockProperties.otherRockType,
        otherProperties: rockProperties.otherProperties,
    };
}