
import { DayWorkStatus } from "@/constants/DayWorkStatus";
import { BaseBlock, Block, SPT_BLOCK_TYPE_ID } from "@/interfaces/Block";
import { ColourProperties } from "@/interfaces/ColourProperties";
import { SoilProperties } from "@/interfaces/SoilProperties";
import { SptBlock } from "@/interfaces/SptBlock";
import { checkAndReturnDayWorkStatus } from '@/utils/checkFunctions/checkAndReturnDayWorkStatus';
import { stringIsNonNegativeFloat, stringIsNonNegativeInteger, stringToDecimalPoint } from '@/utils/numbers';
import { throwError } from "../error/throwError";
import { checkAndReturnSptBlockDescription } from "./checkAndReturnSptBlockDescription";

type Params = {
    blocks: Block[];
    boreholeId: number;
    dayWorkStatus: DayWorkStatus;
    topDepthInMetresStr: string;
    seatingIncBlows1Str: string;
    seatingIncBlows2Str: string;
    seatingIncPen1Str: string;
    seatingIncPen2Str: string;
    mainIncBlows1Str: string;
    mainIncBlows2Str: string;
    mainIncBlows3Str: string;
    mainIncBlows4Str: string;
    mainIncPen1Str: string;
    mainIncPen2Str: string;
    mainIncPen3Str: string;
    mainIncPen4Str: string;
    recoveryLengthInMillimetresStr: string;
    colourProperties: ColourProperties;
    soilProperties: SoilProperties;
    isSeatingIncBlows1Active: boolean;
    isSeatingIncBlows2Active: boolean;
    isMainIncBlows1Active: boolean;
    isMainIncBlows2Active: boolean;
    isMainIncBlows3Active: boolean;
    isMainIncBlows4Active: boolean;
    isSeatingIncPen1Active: boolean;
    isSeatingIncPen2Active: boolean;
    isMainIncPen1Active: boolean;
    isMainIncPen2Active: boolean;
    isMainIncPen3Active: boolean;
    isMainIncPen4Active: boolean;
};

export function checkAndReturnSptBlock({
    blocks,
    boreholeId,
    dayWorkStatus,
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
    colourProperties,
    soilProperties,
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
}: Params): BaseBlock & SptBlock {

    dayWorkStatus = checkAndReturnDayWorkStatus(dayWorkStatus);

    if (!stringIsNonNegativeFloat(topDepthInMetresStr)) {
        throwError('Error: Top Depth');
    }
    if (!stringIsNonNegativeInteger(seatingIncBlows1Str)) {
        throwError(`Error: seatingIncBlows1Str`);
    }
    if (!stringIsNonNegativeInteger(seatingIncPen1Str)) {
        throwError(`Error: seatingIncPen1Str`);
    }
    if (parseInt(seatingIncBlows1Str) < 25) {
        if (!stringIsNonNegativeInteger(seatingIncBlows2Str)) {
            throwError(`Error: seatingIncBlows2Str`);
        }
        if (!stringIsNonNegativeInteger(seatingIncPen2Str)) {
            throwError(`Error: seatingIncPen2Str`);
        }
    }
    if (!stringIsNonNegativeInteger(mainIncBlows1Str)) {
        throwError(`Error: mainIncBlows1Str`);
    }
    if (!stringIsNonNegativeInteger(mainIncPen1Str)) {
        throwError(`Error: mainIncPen1Str`);
    }
    if (parseInt(mainIncBlows1Str) < 50) {
        if (!stringIsNonNegativeInteger(mainIncBlows2Str)) {
            throwError(`Error: mainIncBlows2Str`);
        }
        if (!stringIsNonNegativeInteger(mainIncPen2Str)) {
            throwError(`Error: mainIncPen2Str`);
        }
    }
    if (parseInt(mainIncBlows1Str) + parseInt(mainIncBlows2Str) < 50) {
        if (!stringIsNonNegativeInteger(mainIncBlows3Str)) {
            throwError(`Error: mainIncBlows3Str`);
        }
        if (!stringIsNonNegativeInteger(mainIncPen3Str)) {
            throwError(`Error: mainIncPen3Str`);
        }
    }
    if (parseInt(mainIncBlows1Str) + parseInt(mainIncBlows2Str) + parseInt(mainIncBlows3Str) < 50) {
        if (!stringIsNonNegativeInteger(mainIncBlows4Str)) {
            throwError(`Error: mainIncBlows4Str`);
        }
        if (!stringIsNonNegativeInteger(mainIncPen4Str)) {
            throwError(`Error: mainIncPen4Str`);
        }
    }
    if (!stringIsNonNegativeInteger(recoveryLengthInMillimetresStr)) {
        throwError('Error: Recovery Length');
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
        throwError('Error: Recovery Length');
    }
    const recoveryInPercentage: number = parseFloat((recoveryLengthInMillimetres / totalPenetrationInMillimetres * 100).toFixed(1));

    const description: string = checkAndReturnSptBlockDescription(    
        recoveryLengthInMillimetres,
        colourProperties,
        soilProperties,
        sptNValue,
    );

    const sptIndex: number = blocks.filter((block: Block) => block.blockTypeId === SPT_BLOCK_TYPE_ID).length + 1;
    const disturbedSampleIndex: number = (recoveryLengthInMillimetres === 0) ? -1 : blocks.filter((block: Block) => block.blockTypeId === SPT_BLOCK_TYPE_ID && block.recoveryInPercentage > 0).length + 1;

    const newBlock: Block = {
        id: blocks.length + 1,
        blockId: blocks.length + 1,
        blockTypeId: SPT_BLOCK_TYPE_ID,
        boreholeId: boreholeId,
        sptIndex: sptIndex,
        disturbedSampleIndex: disturbedSampleIndex,
        dayWorkStatus: dayWorkStatus,
        topDepthInMetres: topDepthInMetres,
        baseDepthInMetres: baseDepthInMetres,
        description: description,
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
        colourProperties: colourProperties,
        soilProperties: soilProperties,
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
    return newBlock;
}