import { DayWorkStatus } from "@/constants/DayWorkStatus";
import { CONSTANT_HEAD_PERMEABILITY_TEST_SYMBOL } from "@/constants/symbol";
import { BaseBlock, Block, CONSTANT_HEAD_PERMEABILITY_TEST_BLOCK_TYPE_ID } from "@/interfaces/Block";
import { ConstantHeadPermeabilityTestBlock } from "@/interfaces/ConstantHeadPermeabilityTestBlock";
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

export function checkAndReturnConstantHeadPermeabilityTestBlock({
    blocks,
    boreholeId,
    dayWorkStatus,
    topDepthInMetresStr,
    baseDepthInMetresStr,
}: Params): BaseBlock & ConstantHeadPermeabilityTestBlock {

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

    const permeabilityTestIndex: number = blocks.filter((block: Block) => block.blockTypeId === CONSTANT_HEAD_PERMEABILITY_TEST_BLOCK_TYPE_ID).length + 1;

    const newBlock: BaseBlock & ConstantHeadPermeabilityTestBlock = {
        id: blocks.length + 1,
        blockId: blocks.length + 1,
        blockTypeId: CONSTANT_HEAD_PERMEABILITY_TEST_BLOCK_TYPE_ID,
        symbol: CONSTANT_HEAD_PERMEABILITY_TEST_SYMBOL,
        boreholeId: boreholeId, 
        permeabilityTestIndex: permeabilityTestIndex,
        dayWorkStatus: dayWorkStatus,
        topDepthInMetres: topDepthInMetres,
        baseDepthInMetres: baseDepthInMetres,
        description: 'Constant Head Permeability Test',
    };

    return newBlock;
}