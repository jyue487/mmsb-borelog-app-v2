
import { Colour } from "@/constants/colour";
import { DayWorkStatus, DayWorkStatusType } from "@/constants/DayStatus";
import {
    DominantSoilType,
    SecondarySoilType
} from "@/constants/soil";
import { BaseBlock, Block, SPT_BLOCK_TYPE_ID } from "@/interfaces/Block";
import { SptBlock } from "@/interfaces/SptBlock";
import { checkAndReturnDayWorkStatus } from '@/utils/checkFunctions/checkAndReturnDayWorkStatus';
import { isNonNegativeFloat, isNonNegativeInteger, stringToDecimalPoint } from '@/utils/numbers';

type Params = {
    blocks: Block[],
    boreholeId: number,
    dayWorkStatusType: DayWorkStatusType,
    dayStartWorkDate: Date,
    dayStartWorkTime: Date,
    dayEndWorkDate: Date,
    dayEndWorkTime: Date,
    waterLevelInMetresStr: string,
    casingDepthInMetresStr: string,
    topDepthInMetresStr: string,
    seatingIncBlows1Str: string,
    seatingIncBlows2Str: string,
    seatingIncPen1Str: string,
    seatingIncPen2Str: string,
    mainIncBlows1Str: string,
    mainIncBlows2Str: string,
    mainIncBlows3Str: string,
    mainIncBlows4Str: string,
    mainIncPen1Str: string,
    mainIncPen2Str: string,
    mainIncPen3Str: string,
    mainIncPen4Str: string,
    recoveryLengthInMillimetresStr: string,
    dominantColour: Colour | null,
    secondaryColour: Colour | null,
    dominantSoilType: DominantSoilType | null,
    secondarySoilType: SecondarySoilType | null,
    otherProperties: string,
    isSeatingIncBlows1Active: boolean,
    isSeatingIncBlows2Active: boolean,
    isMainIncBlows1Active: boolean,
    isMainIncBlows2Active: boolean,
    isMainIncBlows3Active: boolean,
    isMainIncBlows4Active: boolean,
    isSeatingIncPen1Active: boolean,
    isSeatingIncPen2Active: boolean,
    isMainIncPen1Active: boolean,
    isMainIncPen2Active: boolean,
    isMainIncPen3Active: boolean,
    isMainIncPen4Active: boolean,
};

export function checkAndReturnSptBlock({
    blocks,
    boreholeId,
    dayWorkStatusType,
    dayStartWorkDate,
    dayStartWorkTime,
    dayEndWorkDate,
    dayEndWorkTime,
    waterLevelInMetresStr,
    casingDepthInMetresStr,
    topDepthInMetresStr,
    seatingIncBlows1Str,
    seatingIncBlows2Str,
    seatingIncPen1Str,
    seatingIncPen2Str,
    mainIncBlows1Str,
    mainIncBlows2Str,
    mainIncBlows3Str,
    mainIncBlows4Str,
    mainIncPen1Str,
    mainIncPen2Str,
    mainIncPen3Str,
    mainIncPen4Str,
    recoveryLengthInMillimetresStr,
    dominantColour,
    secondaryColour,
    dominantSoilType,
    secondarySoilType,
    otherProperties,
    isSeatingIncBlows1Active,
    isSeatingIncBlows2Active,
    isMainIncBlows1Active,
    isMainIncBlows2Active,
    isMainIncBlows3Active,
    isMainIncBlows4Active,
    isSeatingIncPen1Active,
    isSeatingIncPen2Active,
    isMainIncPen1Active,
    isMainIncPen2Active,
    isMainIncPen3Active,
    isMainIncPen4Active,
}: Params): BaseBlock & SptBlock | null {
    const dayWorkStatus: DayWorkStatus | undefined = checkAndReturnDayWorkStatus({
        dayWorkStatusType: dayWorkStatusType,
        dayStartWorkDate: dayStartWorkDate,
        dayStartWorkTime: dayStartWorkTime,
        dayEndWorkDate: dayEndWorkDate,
        dayEndWorkTime: dayEndWorkTime,
        waterLevelInMetresStr: waterLevelInMetresStr,
        casingDepthInMetresStr: casingDepthInMetresStr,
    });
    if (!dayWorkStatus) {
        return null;
    }
    if (!isNonNegativeFloat(topDepthInMetresStr)) {
        alert('Error: Top Depth');
        return null;
    }
    if (!isNonNegativeInteger(seatingIncBlows1Str)) {
        alert(`Error: seatingIncBlows1Str`);
        return null;
    }
    if (!isNonNegativeInteger(seatingIncPen1Str)) {
        alert(`Error: seatingIncPen1Str`);
        return null;
    }
    if (parseInt(seatingIncBlows1Str) < 25) {
        if (!isNonNegativeInteger(seatingIncBlows2Str)) {
            alert(`Error: seatingIncBlows2Str`);
            return null;
        }
        if (!isNonNegativeInteger(seatingIncPen2Str)) {
            alert(`Error: seatingIncPen2Str`);
            return null;
        }
    }
    if (!isNonNegativeInteger(mainIncBlows1Str)) {
        alert(`Error: mainIncBlows1Str`);
        return null;
    }
    if (!isNonNegativeInteger(mainIncPen1Str)) {
        alert(`Error: mainIncPen1Str`);
        return null;
    }
    if (parseInt(mainIncBlows1Str) < 50) {
        if (!isNonNegativeInteger(mainIncBlows2Str)) {
            alert(`Error: mainIncBlows2Str`);
            return null;
        }
        if (!isNonNegativeInteger(mainIncPen2Str)) {
            alert(`Error: mainIncPen2Str`);
            return null;
        }
    }
    if (parseInt(mainIncBlows1Str) + parseInt(mainIncBlows2Str) < 50) {
        if (!isNonNegativeInteger(mainIncBlows3Str)) {
            alert(`Error: mainIncBlows3Str`);
            return null;
        }
        if (!isNonNegativeInteger(mainIncPen3Str)) {
            alert(`Error: mainIncPen3Str`);
            return null;
        }
    }
    if (parseInt(mainIncBlows1Str) + parseInt(mainIncBlows2Str) + parseInt(mainIncBlows3Str) < 50) {
        if (!isNonNegativeInteger(mainIncBlows4Str)) {
            alert(`Error: mainIncBlows4Str`);
            return null;
        }
        if (!isNonNegativeInteger(mainIncPen4Str)) {
            alert(`Error: mainIncPen4Str`);
            return null;
        }
    }
    if (!isNonNegativeInteger(recoveryLengthInMillimetresStr)) {
        alert('Error: Recovery Length');
        return null;
    }

    const topDepthInMetres: number = stringToDecimalPoint(topDepthInMetresStr, 3);
    const topDepthInMillimetres: number = topDepthInMetres * 1000;
    const seatingIncBlows1: number = parseInt(seatingIncBlows1Str);
    const seatingIncPen1: number = parseInt(seatingIncPen1Str);
    const seatingIncBlows2: number | null = isNaN(parseInt(seatingIncBlows2Str)) ? null : parseInt(seatingIncBlows2Str);
    const seatingIncPen2: number | null = isNaN(parseInt(seatingIncPen2Str)) ? null : parseInt(seatingIncPen2Str);
    const mainIncBlows1: number = parseInt(mainIncBlows1Str);
    const mainIncPen1: number = parseInt(mainIncPen1Str);
    const mainIncBlows2: number | null = isNaN(parseInt(mainIncBlows2Str)) ? null : parseInt(mainIncBlows2Str);
    const mainIncPen2: number | null = isNaN(parseInt(mainIncPen2Str)) ? null : parseInt(mainIncPen2Str);
    const mainIncBlows3: number | null = isNaN(parseInt(mainIncBlows3Str)) ? null : parseInt(mainIncBlows3Str);
    const mainIncPen3: number | null = isNaN(parseInt(mainIncPen3Str)) ? null : parseInt(mainIncPen3Str);
    const mainIncBlows4: number | null = isNaN(parseInt(mainIncBlows4Str)) ? null : parseInt(mainIncBlows4Str);
    const mainIncPen4: number | null = isNaN(parseInt(mainIncPen4Str)) ? null : parseInt(mainIncPen4Str);
    const totalMainPenetrationInMillimetres: number = (
        mainIncPen1 + (mainIncPen2 ?? 0) + (mainIncPen3 ?? 0) + (mainIncPen4 ?? 0)
    );
    const totalPenetrationInMillimetres: number = (
        seatingIncPen1 + (seatingIncPen2 ?? 0) + totalMainPenetrationInMillimetres
    );
    const baseDepthInMetres: number = (topDepthInMillimetres + totalPenetrationInMillimetres) / 1000;
    const sptNValue: number = mainIncBlows1 + (mainIncBlows2 ?? 0) + (mainIncBlows3 ?? 0) + (mainIncBlows4 ?? 0);
    const recoveryLengthInMillimetres: number = parseInt(recoveryLengthInMillimetresStr);
    if (recoveryLengthInMillimetres > totalPenetrationInMillimetres) {
        alert('Error: Recovery Length');
        return null;
    }
    const recoveryInPercentage: number = parseFloat((recoveryLengthInMillimetres / totalPenetrationInMillimetres * 100).toFixed(1));

    let soilDescription: string = '';
    if (recoveryLengthInMillimetres === 0) {
        soilDescription = 'No recovery';
    } else {
        if (!dominantColour) {
            alert('Error: Dominant Colour');
            return null;
        }
        if (!dominantSoilType) {
            alert('Error: Dominant Soil Type');
            return null;
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
        soilDescription += `${consistency},`;

        const totalColourLevel = dominantColour.level;
        let colourLevel = '';
        if (totalColourLevel <= 1) {
            colourLevel = 'dark';
        } else if (totalColourLevel <= 2) {
            colourLevel = 'medium';
        } else if (totalColourLevel <= 3) {
            colourLevel = 'light';
        } else {
            colourLevel = 'pale';
        }
        soilDescription += ` ${colourLevel}`;

        let colourDescription = '';
        if (!secondaryColour) {
            colourDescription = `${dominantColour.colourNameForSoilDescription}`;
        } else {
            colourDescription = `${secondaryColour.colourNameForSoilDescription} ${dominantColour.colourNameForSoilDescription}`;
        }
        soilDescription += ` ${colourDescription}`;

        if (!secondarySoilType) {
            soilDescription += ` ${dominantSoilType}`;
        } else {
            soilDescription += ` ${secondarySoilType} ${dominantSoilType}`;
        }
        if (otherProperties) {
            soilDescription += ` ${otherProperties}`;
        }
    }

    const sptIndex: number = blocks.filter((block: Block) => block.blockTypeId === SPT_BLOCK_TYPE_ID).length + 1;
    const disturbedSampleIndex: number = (recoveryLengthInMillimetres === 0) ? -1 : blocks.filter((block: Block) => block.blockTypeId === SPT_BLOCK_TYPE_ID && block.recoveryInPercentage > 0).length + 1;

    const newSptBlock: Block = {
        id: blocks.length + 1,
        blockId: blocks.length + 1,
        blockTypeId: SPT_BLOCK_TYPE_ID,
        boreholeId: boreholeId,
        sptIndex: sptIndex,
        disturbedSampleIndex: disturbedSampleIndex,
        dayWorkStatus: dayWorkStatus,
        topDepthInMetres: topDepthInMetres,
        baseDepthInMetres: baseDepthInMetres,
        soilDescription: soilDescription,
        seatingIncBlows1: seatingIncBlows1,
        seatingIncPen1: seatingIncPen1,
        seatingIncBlows2: seatingIncBlows2,
        seatingIncPen2: seatingIncPen2,
        mainIncBlows1: mainIncBlows1,
        mainIncPen1: mainIncPen1,
        mainIncBlows2: mainIncBlows2,
        mainIncPen2: mainIncPen2,
        mainIncBlows3: mainIncBlows3,
        mainIncPen3: mainIncPen3,
        mainIncBlows4: mainIncBlows4,
        mainIncPen4: mainIncPen4,
        sptNValue: sptNValue,
        totalMainPenetrationInMillimetres: totalMainPenetrationInMillimetres,
        recoveryInPercentage: recoveryInPercentage,
        recoveryLengthInMillimetres: recoveryLengthInMillimetres,
        dominantColour: dominantColour,
        secondaryColour: secondaryColour,
        dominantSoilType: dominantSoilType,
        secondarySoilType: secondarySoilType,
        otherProperties: otherProperties,
        isSeatingIncBlows1Active: isSeatingIncBlows1Active,
        isSeatingIncBlows2Active: isSeatingIncBlows2Active,
        isMainIncBlows1Active: isMainIncBlows1Active,
        isMainIncBlows2Active: isMainIncBlows2Active,
        isMainIncBlows3Active: isMainIncBlows3Active,
        isMainIncBlows4Active: isMainIncBlows4Active,
        isSeatingIncPen1Active: isSeatingIncPen1Active,
        isSeatingIncPen2Active: isSeatingIncPen2Active,
        isMainIncPen1Active: isMainIncPen1Active,
        isMainIncPen2Active: isMainIncPen2Active,
        isMainIncPen3Active: isMainIncPen3Active,
        isMainIncPen4Active: isMainIncPen4Active,
    };
    return newSptBlock;
}