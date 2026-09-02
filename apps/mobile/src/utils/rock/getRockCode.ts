import { ROCK_TYPE_CODE_MAP, RockType } from '@mmsb/core';

export function getRockCode(rockType: RockType): number {
  return ROCK_TYPE_CODE_MAP[rockType];
}