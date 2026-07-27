import { ROCK_TYPE_CODE_MAP, RockType } from '@/src/constants/rock';

export function getRockCode(rockType: RockType): number {
  return ROCK_TYPE_CODE_MAP[rockType];
}