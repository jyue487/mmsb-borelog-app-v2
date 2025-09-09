import { RockProperties } from "@/interfaces/RockProperties";

export function deserializeRockProperties(rockProperties: any): RockProperties {
    return {
        rockType: rockProperties.rockType,
        otherRockType: rockProperties.otherRockType,
        otherProperties: rockProperties.otherProperties,
    };
}