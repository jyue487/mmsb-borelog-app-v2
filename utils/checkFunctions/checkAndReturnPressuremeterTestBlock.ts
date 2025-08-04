import { DayWorkStatus } from "@/constants/DayWorkStatus";
import { PRESSUREMETER_TEST_SYMBOL } from "@/constants/symbol";
import { BaseBlock, Block, PRESSUREMETER_TEST_BLOCK_TYPE_ID } from "@/interfaces/Block";
import { PressuremeterTestBlock } from "@/interfaces/PressuremeterTestBlock";
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

export function checkAndReturnPressuremeterTestBlock({
    blocks,
    boreholeId,
    dayWorkStatus,
    topDepthInMetresStr,
    baseDepthInMetresStr,
}: Params): BaseBlock & PressuremeterTestBlock {

    dayWorkStatus = checkAndReturnDayWorkStatus(dayWorkStatus);
    
    if (isNaN(parseFloat(topDepthInMetresStr)) || parseFloat(topDepthInMetresStr) < 0) {
        throwError('Error: Top Depth');
    }
    if (isNaN(parseFloat(baseDepthInMetresStr)) || parseFloat(baseDepthInMetresStr) < parseFloat(topDepthInMetresStr)) {
        throwError('Error: Base Depth');
    }
    
    const topDepthInMetres: number = stringToDecimalPoint(topDepthInMetresStr, 3);
    const baseDepthInMetres: number = stringToDecimalPoint(baseDepthInMetresStr, 3);

    const pressuremeterTestIndex: number = blocks.filter((block: Block) => block.blockTypeId === PRESSUREMETER_TEST_BLOCK_TYPE_ID).length + 1;

    const newBlock: BaseBlock & PressuremeterTestBlock = {
        id: blocks.length + 1,
        blockId: blocks.length + 1,
        blockTypeId: PRESSUREMETER_TEST_BLOCK_TYPE_ID,
        symbol: PRESSUREMETER_TEST_SYMBOL,
        boreholeId: boreholeId, 
        pressuremeterTestIndex: pressuremeterTestIndex,
        dayWorkStatus: dayWorkStatus,
        topDepthInMetres: topDepthInMetres,
        baseDepthInMetres: baseDepthInMetres,
        description: 'Pressuremeter Test',
    };

    return newBlock;
}