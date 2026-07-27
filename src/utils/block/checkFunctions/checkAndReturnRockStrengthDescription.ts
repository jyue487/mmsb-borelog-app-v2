export function checkAndReturnRockStrengthDescription(rqdInPercentage: number): string {
  let description: string = '';
  if (rqdInPercentage <= 25) {
    description = 'Weak to moderately strong';
  } else if (rqdInPercentage <= 50) {
    description = 'Moderately strong';
  } else if (rqdInPercentage <= 75) {
    description = 'Strong';
  } else {
    description = 'Very strong';
  }
  return description;
}