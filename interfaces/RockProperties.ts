import { RockType } from "@/constants/rock";

export interface RockProperties {
  rockType: RockType | null;
  rockCode: number | null;
  otherRockType: string;
  otherProperties: string;
}

export function createDefaultRockProperties(): RockProperties {
  return {
    rockType: null,
    rockCode: null,
    otherRockType: '',
    otherProperties: '',
  };
}