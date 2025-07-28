
import { DayWorkStatus, DayWorkStatusType } from "@/constants/DayStatus";
import { Colour } from "@/constants/colour";
import { RockType } from "@/constants/rock";
import { BaseBlock, Block, CORING_BLOCK_TYPE_ID } from "@/interfaces/Block";
import { CoringBlock } from "@/interfaces/CoringBlock";
import { checkAndReturnDayWorkStatus } from "@/utils/checkFunctions/checkAndReturnDayWorkStatus";
import { stringToDecimalPoint } from "@/utils/numbers";

type Params = {
    blocks: Block[];
    boreholeId: number;
    dayWorkStatusType: DayWorkStatusType;
    dayStartWorkDate: Date;
    dayStartWorkTime: Date;
    dayEndWorkDate: Date;
    dayEndWorkTime: Date;
    waterLevelInMetresStr: string;
    casingDepthInMetresStr: string;
    topDepthInMetresStr: string;
    coreRunInMetresStr: string;
    coreRecoveryInMetresStr: string;
    rqdInMetresStr: string;
    dominantColour: Colour | null;
    secondaryColour: Colour | null;
    rockType: RockType | null;
    otherRockType: string;
    otherProperties: string;
};

export function checkAndReturnCoringBlock({
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
    coreRunInMetresStr,
    coreRecoveryInMetresStr,
    rqdInMetresStr,
    dominantColour,
    secondaryColour,
    rockType,
    otherRockType,
    otherProperties,
}: Params): BaseBlock & CoringBlock | null {
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
    if (isNaN(parseFloat(topDepthInMetresStr)) || parseFloat(topDepthInMetresStr) < 0) {
        alert('Error: Top Depth');
        return null;
    }
    if (isNaN(parseFloat(coreRunInMetresStr)) || parseFloat(coreRunInMetresStr) < 0) {
        alert('Error: Core Run');
        return null;
    }
    if (isNaN(parseFloat(coreRecoveryInMetresStr)) || parseFloat(coreRecoveryInMetresStr) < 0) {
        alert('Error: Core Recovery');
        return null;
    }

    const topDepthInMetres: number = stringToDecimalPoint(topDepthInMetresStr, 3);
    const topDepthInMillimetres: number = topDepthInMetres * 1000;
    const coreRunInMetres: number = stringToDecimalPoint(coreRunInMetresStr, 3);
    const coreRunInMillimetres: number = coreRunInMetres * 1000;
    const coreRecoveryInMetres: number = stringToDecimalPoint(coreRecoveryInMetresStr, 3);
    const coreRecoveryInMillimetres: number = coreRecoveryInMetres * 1000;
    const coreRecoveryInPercentage: number = parseFloat((coreRecoveryInMillimetres / coreRunInMillimetres * 100).toFixed(1));
    const baseDepthInMetres: number = (topDepthInMillimetres + coreRunInMillimetres) / 1000;
    
    let rockDescription: string = '';
    let rqdInPercentage: number = 0;
    let rqdInMetres: number = 0;
    if (coreRecoveryInPercentage === 0) {
        rockDescription = 'No recovery';
        rqdInPercentage = 0;
    } else {
        if (isNaN(parseFloat(rqdInMetresStr)) || parseFloat(rqdInMetresStr) < 0) {
            alert('Error: R.Q.D.');
            return null;
        }
        rqdInMetres = parseFloat(parseFloat(rqdInMetresStr).toFixed(3));
        const rqdInMillimetres: number = rqdInMetres * 1000;
        rqdInPercentage = parseFloat((rqdInMillimetres / coreRunInMillimetres * 100).toFixed(1));

        if (!dominantColour) {
            alert('Error: Dominant Colour');
            return null;
        }
        if (!rockType) {
            alert('Error: Rock Type');
            return null;
        }
        let rockStrength: string = '';
        if (rqdInPercentage <= 50) {
            rockStrength = 'Moderately strong';
        } else if (rqdInPercentage <= 75) {
            rockStrength = 'Strong';
        } else {
            rockStrength = 'Very strong';
        }
        rockDescription += `${rockStrength},`;

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
        rockDescription += ` ${colourLevel}`;

        let colourDescription = '';
        if (!secondaryColour) {
            colourDescription = `${dominantColour.colourNameForSoilDescription}`;
        } else {
            colourDescription = `${secondaryColour.colourNameForSoilDescription} ${dominantColour.colourNameForSoilDescription}`;
        }
        rockDescription += ` ${colourDescription}`;

        let weatheringClassification = '';
        if (rqdInPercentage < 25) {
            weatheringClassification = 'highly weathered (Grade IV), very poor';
        } else if (rqdInPercentage <= 50) {
            weatheringClassification = 'moderately weathered (Grade III), poor';
        } else if (rqdInPercentage <= 75) {
            weatheringClassification = 'slightly weathered (Grade II), fair';
        } else if (rqdInPercentage <= 85) {
            weatheringClassification = 'slightly weathered (Grade II) to fresh, good';
        } else {
            weatheringClassification = 'fresh (Grade I), excellent';
        }
        rockDescription += ` ${weatheringClassification}`;

        let rockTypeDescription = '';
        if (rockType === 'OTHERS') {
            if (!otherRockType.trim()) {
                alert('Error: Other Rock Type');
                return null;
            }
            rockTypeDescription = otherRockType.trim();
        } else {
            rockTypeDescription = rockType;
        }
        rockDescription += ` ${rockTypeDescription}`;

        if (otherProperties.length > 0) {
            rockDescription += ` ${otherProperties}`;
        }
    }

    const rockSampleIndex: number = (coreRecoveryInMetres === 0 ) ? -1 : blocks.filter((block: Block) => block.blockTypeId === CORING_BLOCK_TYPE_ID && block.coreRecoveryInPercentage > 0).length + 1;

    const newCoringBlock: Block = {
        id: blocks.length + 1,
        blockTypeId: CORING_BLOCK_TYPE_ID,
        boreholeId: boreholeId, 
        blockId: 1,
        rockSampleIndex: rockSampleIndex,
        dayWorkStatus: dayWorkStatus,
        topDepthInMetres: topDepthInMetres,
        baseDepthInMetres: baseDepthInMetres,
        rockDescription: rockDescription,
        coreRunInMetres: coreRunInMetres,
        coreRecoveryInPercentage: coreRecoveryInPercentage,
        rqdInPercentage: rqdInPercentage,
        coreRecoveryInMetres: coreRecoveryInMetres,
        rqdInMetres: rqdInMetres,
        dominantColour: dominantColour,
        secondaryColour: secondaryColour,
        rockType: rockType,
        otherRockType: otherRockType,
        otherProperties: otherProperties,
    };
    return newCoringBlock;
}