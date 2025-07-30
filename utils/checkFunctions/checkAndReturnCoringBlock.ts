
import { DayWorkStatus } from "@/constants/DayWorkStatus";
import { BaseBlock, Block, CORING_BLOCK_TYPE_ID } from "@/interfaces/Block";
import { ColourProperties } from "@/interfaces/ColourProperties";
import { CoringBlock } from "@/interfaces/CoringBlock";
import { RockProperties } from "@/interfaces/RockProperties";
import { checkAndReturnDayWorkStatus } from "@/utils/checkFunctions/checkAndReturnDayWorkStatus";
import { stringIsNonNegativeFloat, stringToDecimalPoint } from "@/utils/numbers";
import { throwError } from "../error/throwError";
import { checkAndReturnCoringBlockDescription } from "./checkAndReturnCoringBlockDescription";

type Params = {
    blocks: Block[];
    boreholeId: number;
    dayWorkStatus: DayWorkStatus;
    topDepthInMetresStr: string;
    coreRunInMetresStr: string;
    coreRecoveryInMetresStr: string;
    rqdInMetresStr: string;
    colourProperties: ColourProperties;
    rockProperties: RockProperties;
};

export function checkAndReturnCoringBlock({
    blocks,
    boreholeId,
    dayWorkStatus,
    topDepthInMetresStr,
    coreRunInMetresStr,
    coreRecoveryInMetresStr,
    rqdInMetresStr,
    colourProperties,
    rockProperties,
}: Params): BaseBlock & CoringBlock {

    dayWorkStatus = checkAndReturnDayWorkStatus(dayWorkStatus);

    if (!stringIsNonNegativeFloat(topDepthInMetresStr)) {
        throwError('Error: Top Depth');
    }
    if (!stringIsNonNegativeFloat(coreRunInMetresStr)) {
        throwError('Error: Core Run');
    }
    if (!stringIsNonNegativeFloat(coreRecoveryInMetresStr)) {
        throwError('Error: Core Recovery');
    }
    if (stringToDecimalPoint(coreRecoveryInMetresStr, 3) > 0 && !stringIsNonNegativeFloat(rqdInMetresStr)) {
        throwError('Error: R.Q.D.');
    }

    const topDepthInMetres: number = stringToDecimalPoint(topDepthInMetresStr, 3);
    const topDepthInMillimetres: number = topDepthInMetres * 1000;
    const coreRunInMetres: number = stringToDecimalPoint(coreRunInMetresStr, 3);
    const coreRunInMillimetres: number = coreRunInMetres * 1000;
    const coreRecoveryInMetres: number = stringToDecimalPoint(coreRecoveryInMetresStr, 3);
    const coreRecoveryInMillimetres: number = coreRecoveryInMetres * 1000;
    const coreRecoveryInPercentage: number = parseFloat((coreRecoveryInMillimetres / coreRunInMillimetres * 100).toFixed(1));
    const baseDepthInMetres: number = (topDepthInMillimetres + coreRunInMillimetres) / 1000;
    const rqdInMetres: number = (coreRecoveryInPercentage === 0) ? 0 : stringToDecimalPoint(rqdInMetresStr, 3);
    const rqdInMillimetres: number = rqdInMetres * 1000;
    const rqdInPercentage = parseFloat((rqdInMillimetres / coreRunInMillimetres * 100).toFixed(1));

    const description: string = checkAndReturnCoringBlockDescription(
        coreRecoveryInPercentage,
        rqdInPercentage,
        colourProperties,
        rockProperties,
    );

    const rockSampleIndex: number = (coreRecoveryInMetres === 0 ) ? -1 : blocks.filter((block: Block) => block.blockTypeId === CORING_BLOCK_TYPE_ID && block.coreRecoveryInPercentage > 0).length + 1;

    const newCoringBlock: Block = {
        id: blocks.length + 1,
        blockId: blocks.length + 1,
        blockTypeId: CORING_BLOCK_TYPE_ID,
        boreholeId: boreholeId, 
        rockSampleIndex: rockSampleIndex,
        dayWorkStatus: dayWorkStatus,
        topDepthInMetres: topDepthInMetres,
        baseDepthInMetres: baseDepthInMetres,
        description: description,
        coreRunInMetres: coreRunInMetres,
        coreRecoveryInPercentage: coreRecoveryInPercentage,
        rqdInPercentage: rqdInPercentage,
        coreRecoveryInMetres: coreRecoveryInMetres,
        rqdInMetres: rqdInMetres,
        colourProperties: colourProperties,
        rockProperties: rockProperties,
    };
    return newCoringBlock;
}