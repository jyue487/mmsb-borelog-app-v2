export const WL_NIL = 'NIL' as const;
export const WL_FULL = 'FULL' as const;

export const WL_STRING_TYPE_LIST = [
  WL_NIL,
  WL_FULL,
] as const;
export type WaterLevelStringType = typeof WL_STRING_TYPE_LIST[number];

export function stringIsWaterLevelStringType(str: string): str is WaterLevelStringType {
  return (WL_STRING_TYPE_LIST as readonly string[]).includes(str);
}

export type WaterLevelInMetres = string | number | null;