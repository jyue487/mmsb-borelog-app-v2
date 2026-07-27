import { stringIsWaterLevelStringType, WaterLevelInMetres } from "@/src/constants/waterLevel";
import { throwError } from "@/src/utils/error/throwError";
import { isNonNegative } from "@/src/utils/numbers";

export function checkAndReturnWaterLevelInMetres(waterLevelInMetres: WaterLevelInMetres): string | number | null {
  if (waterLevelInMetres === null) {
    return waterLevelInMetres;
  }
  if (typeof waterLevelInMetres === 'number') {
    if (!isNonNegative(waterLevelInMetres)) {
      throwError('Error: Water Level should not have a negative value');
    }
    return waterLevelInMetres;
  }
  waterLevelInMetres = waterLevelInMetres.trim().toUpperCase();
  if (stringIsWaterLevelStringType(waterLevelInMetres)) {
    throwError('Error: Water Level should be either NIL or FULL');
  }
  return waterLevelInMetres;
}
