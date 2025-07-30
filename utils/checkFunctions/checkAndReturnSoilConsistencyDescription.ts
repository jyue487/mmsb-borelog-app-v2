import { DominantSoilType } from "@/constants/soil";
import { throwError } from "../error/throwError";

export function checkAndReturnSoilConsistencyDescription(
    dominantSoilType: DominantSoilType | null,
    sptNValue: number,
) {
    if (!dominantSoilType) {
        throwError('Error: Dominant Soil Type');
    }

    let consistency = '';
    if (dominantSoilType === 'SAND' || dominantSoilType === 'GRAVEL') {
        if (sptNValue < 4) {
            consistency = 'Very Loose';
        } else if (sptNValue < 10) {
            consistency = 'Loose';
        } else if (sptNValue < 30) {
            consistency = 'Medium Dense';
        } else if (sptNValue < 50) {
            consistency = 'Dense';
        } else {
            consistency = 'Very Dense';
        }
    } else {
        if (sptNValue < 2) {
            consistency = 'Very Soft';
        } else if (sptNValue < 4) {
            consistency = 'Soft';
        } else if (sptNValue < 8) {
            consistency = 'Firm';
        } else if (sptNValue < 15) {
            consistency = 'Stiff';
        } else if (sptNValue <= 30) {
            consistency = 'Very Stiff';
        } else {
            consistency = 'Hard';
        }
    }
    return consistency;
}