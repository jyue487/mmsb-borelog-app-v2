import {
  DominantSoilType,
  SecondarySoilType,
  SOIL_TYPE_CODE_MAP_DOUBLE_ENTRY,
  SOIL_TYPE_CODE_MAP_SINGLE_ENTRY,
} from '@mmsb/core';

export function getSoilCode(dominantSoilType: DominantSoilType, secondarySoilType: SecondarySoilType | null): number {
  if (secondarySoilType === null) {
    return SOIL_TYPE_CODE_MAP_SINGLE_ENTRY[dominantSoilType];
  }

  if (!(dominantSoilType in SOIL_TYPE_CODE_MAP_DOUBLE_ENTRY)) {
    return SOIL_TYPE_CODE_MAP_SINGLE_ENTRY[dominantSoilType];
  }

  const dominantMap = SOIL_TYPE_CODE_MAP_DOUBLE_ENTRY[
    dominantSoilType as keyof typeof SOIL_TYPE_CODE_MAP_DOUBLE_ENTRY
  ];

  const code = dominantMap[secondarySoilType as keyof typeof dominantMap];

  return code ?? SOIL_TYPE_CODE_MAP_SINGLE_ENTRY[dominantSoilType];
}