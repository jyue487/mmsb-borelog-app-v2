export function checkAndReturnWeatheringClassificationDescription(rqdInPercentage: number): string {
    let description = '';
    if (rqdInPercentage < 25) {
        description = 'highly weathered (Grade IV), very poor';
    } else if (rqdInPercentage <= 50) {
        description = 'moderately weathered (Grade III), poor';
    } else if (rqdInPercentage <= 75) {
        description = 'slightly weathered (Grade II), fair';
    } else if (rqdInPercentage <= 85) {
        description = 'slightly weathered (Grade II) to fresh, good';
    } else {
        description = 'fresh (Grade I), excellent';
    }
    return description;
}