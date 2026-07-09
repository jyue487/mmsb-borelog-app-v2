import { WaterLevelInMetres, WL_STRING_TYPE_LIST, WaterLevelStringType, stringIsWaterLevelStringType } from "@/constants/waterLevel";
import { stringIsNonNegativeFloat, stringToDecimalPoint } from "./numbers";
import { throwError } from "./error/throwError";

export function waterLevelInMetresToString(waterLevelInMetres: WaterLevelInMetres): string {
  if (waterLevelInMetres === null) {
    return '';
  }
  if (typeof waterLevelInMetres === 'string') {
    return waterLevelInMetres;
  }
  return  waterLevelInMetres.toFixed(3);
}

export function parseWaterLevelInMetresStr(waterLevelInMetresStr: string): WaterLevelInMetres {
  waterLevelInMetresStr = waterLevelInMetresStr.trim();
  if (waterLevelInMetresStr.length === 0) {
    return null;
  }
  if (stringIsNonNegativeFloat(waterLevelInMetresStr)) {
    return stringToDecimalPoint(waterLevelInMetresStr, 3);
  }
  if (stringIsWaterLevelStringType(waterLevelInMetresStr)) {
    return waterLevelInMetresStr;
  }
  throwError('Wrong Input for Water Level');
}