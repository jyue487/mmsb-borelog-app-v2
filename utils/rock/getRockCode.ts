import { RockType, ROCK_TYPE_CODE_MAP } from '@/constants/rock';

export function getRockCode(rockType: RockType): number {
  return ROCK_TYPE_CODE_MAP[rockType];
}