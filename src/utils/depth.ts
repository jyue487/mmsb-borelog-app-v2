import { isNonNegative, roundToDecimalPoint } from "./numbers";

export function depthInMetresToString(depthInMetres: number): string {
  return isNonNegative(depthInMetres) ? roundToDecimalPoint(depthInMetres, 3).toString() : '';
}