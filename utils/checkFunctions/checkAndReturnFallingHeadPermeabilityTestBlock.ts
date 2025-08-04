import { DayWorkStatus } from "@/constants/DayWorkStatus";
import { FALLING_HEAD_PERMEABILITY_TEST_SYMBOL } from "@/constants/symbol";
import { BaseBlock, Block, FALLING_HEAD_PERMEABILITY_TEST_BLOCK_TYPE_ID } from "@/interfaces/Block";
import { FallingHeadPermeabilityTestBlock } from "@/interfaces/FallingHeadPermeabilityTestBlock";
import { throwError } from "../error/throwError";
import { stringToDecimalPoint } from "../numbers";
import { checkAndReturnDayWorkStatus } from "./checkAndReturnDayWorkStatus";

type Params = {
    blocks: Block[];
    boreholeId: number;
    dayWorkStatus: DayWorkStatus;
    topDepthInMetresStr: string;
    baseDepthInMetresStr: string;
};

export function checkAndReturnFallingHeadPermeabilityTestBlock({
    blocks,
    boreholeId,
    dayWorkStatus,
    topDepthInMetresStr,
    baseDepthInMetresStr,
}: Params): BaseBlock & FallingHeadPermeabilityTestBlock {

    dayWorkStatus = checkAndReturnDayWorkStatus(dayWorkStatus);
    
    if (isNaN(parseFloat(topDepthInMetresStr)) || parseFloat(topDepthInMetresStr) < 0) {
        throwError('Error: Top Depth');
    }
    if (baseDepthInMetresStr.trim().length > 0) {
        if (isNaN(parseFloat(baseDepthInMetresStr)) || parseFloat(baseDepthInMetresStr) < parseFloat(topDepthInMetresStr)) {
            throwError('Error: Base Depth');
        }
    }
    
    const topDepthInMetres: number = stringToDecimalPoint(topDepthInMetresStr, 3);
    const baseDepthInMetres: number = (baseDepthInMetresStr.trim().length === 0) ? topDepthInMetres : stringToDecimalPoint(baseDepthInMetresStr, 3);

    const permeabilityTestIndex: number = blocks.filter((block: Block) => block.blockTypeId === FALLING_HEAD_PERMEABILITY_TEST_BLOCK_TYPE_ID).length + 1;

    const newBlock: BaseBlock & FallingHeadPermeabilityTestBlock = {
        id: blocks.length + 1,
        blockId: blocks.length + 1,
        blockTypeId: FALLING_HEAD_PERMEABILITY_TEST_BLOCK_TYPE_ID,
        symbol: FALLING_HEAD_PERMEABILITY_TEST_SYMBOL,
        boreholeId: boreholeId, 
        permeabilityTestIndex: permeabilityTestIndex,
        dayWorkStatus: dayWorkStatus,
        topDepthInMetres: topDepthInMetres,
        baseDepthInMetres: baseDepthInMetres,
        description: 'Falling Head Permeability Test',
    };

    return newBlock;
}