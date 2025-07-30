
import { DayWorkStatus } from "@/constants/DayWorkStatus";
import { BaseBlock, Block, MZ_BLOCK_TYPE_ID, PS_BLOCK_TYPE_ID, UD_BLOCK_TYPE_ID } from "@/interfaces/Block";
import { ColourProperties } from "@/interfaces/ColourProperties";
import { MzBlock } from "@/interfaces/MzBlock";
import { PsBlock } from "@/interfaces/PsBlock";
import { SoilProperties } from "@/interfaces/SoilProperties";
import { UdBlock } from "@/interfaces/UdBlock";
import { checkAndReturnDayWorkStatus } from "@/utils/checkFunctions/checkAndReturnDayWorkStatus";
import { checkAndReturnUndisturbedSampleDescription } from "@/utils/checkFunctions/checkAndReturnUndisturbedSampleDescription";
import { stringIsNonNegativeFloat, stringToDecimalPoint } from "@/utils/numbers";
import { throwError } from "../error/throwError";

type Params = {
    undisturbedSampleBlockTypeId: typeof UD_BLOCK_TYPE_ID | typeof MZ_BLOCK_TYPE_ID | typeof PS_BLOCK_TYPE_ID;
    blocks: Block[];
    boreholeId: number;
    dayWorkStatus: DayWorkStatus;
    topDepthInMetresStr: string;
    penetrationDepthInMetresStr: string;
    recoveryLengthInMetresStr: string;
    topColourProperties: ColourProperties;
    topSoilProperties: SoilProperties;
    baseDitto: boolean;
    bottomColourProperties: ColourProperties;
    bottomSoilProperties: SoilProperties;
};

export function checkAndReturnUndisturbedSampleBlock({
    undisturbedSampleBlockTypeId,
    blocks,
    boreholeId,
    dayWorkStatus,
    topDepthInMetresStr,
    penetrationDepthInMetresStr,
    recoveryLengthInMetresStr,
    topColourProperties,
    topSoilProperties,
    baseDitto,
    bottomColourProperties,
    bottomSoilProperties,
}: Params): BaseBlock & (UdBlock | MzBlock | PsBlock) {

    dayWorkStatus = checkAndReturnDayWorkStatus(dayWorkStatus);

    if (!stringIsNonNegativeFloat(topDepthInMetresStr)) {
        throwError('Error: Top Depth');
    }
    if (!stringIsNonNegativeFloat(penetrationDepthInMetresStr)) {
        throwError('Error: Penetration Depth');
    }
    if (!stringIsNonNegativeFloat(recoveryLengthInMetresStr)) {
        throwError('Error: Recovery Length');
    }

    const topDepthInMetres: number = stringToDecimalPoint(topDepthInMetresStr, 3);
    const topDepthInMillimetres: number = topDepthInMetres * 1000;
    const penetrationDepthInMetres: number = stringToDecimalPoint(penetrationDepthInMetresStr, 3);
    const penetrationDepthInMillimetres: number = penetrationDepthInMetres * 1000;
    const baseDepthInMetres: number = (topDepthInMillimetres + penetrationDepthInMillimetres) / 1000;
    const recoveryLengthInMetres: number = stringToDecimalPoint(recoveryLengthInMetresStr, 3);
    const recoveryInPercentage: number = parseFloat((recoveryLengthInMetres / penetrationDepthInMetres * 100).toFixed(1));

    const description: string = checkAndReturnUndisturbedSampleDescription({
        recoveryLengthInMetres: recoveryLengthInMetres,
        topColourProperties: topColourProperties,
        topSoilProperties: topSoilProperties,
        baseDitto: baseDitto,
        bottomColourProperties: bottomColourProperties,
        bottomSoilProperties: bottomSoilProperties,
    });

    const undisturbedSampleIndex: number = (recoveryLengthInMetres === 0) ? -1 : blocks.filter((block: Block) => block.blockTypeId === undisturbedSampleBlockTypeId && block.recoveryInPercentage > 0).length + 1;

    const newBlock: BaseBlock & (UdBlock | MzBlock | PsBlock) = {
        id: blocks.length + 1,
        blockId: blocks.length + 1,
        blockTypeId: undisturbedSampleBlockTypeId,
        boreholeId: boreholeId, 
        sampleIndex: undisturbedSampleIndex,
        dayWorkStatus: dayWorkStatus,
        topDepthInMetres: topDepthInMetres,
        baseDepthInMetres: baseDepthInMetres,
        soilDescription: description,
        recoveryInPercentage: recoveryInPercentage,
        penetrationDepthInMetres: penetrationDepthInMetres,
        topColourProperties: topColourProperties,
        topSoilProperties: topSoilProperties,
        baseDitto: baseDitto,
        bottomColourProperties: bottomColourProperties,
        bottomSoilProperties: bottomSoilProperties,
        recoveryLengthInMetres: recoveryLengthInMetres,
    };

    return newBlock;
}