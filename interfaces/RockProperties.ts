import { RockType } from "@/constants/rock";

export interface RockProperties {
  rockType: RockType | null;
  otherRockType: string;
  otherProperties: string;
}