import { DayWorkStatus } from "@/constants/DayWorkStatus";
import { LUGEON_TEST_SYMBOL } from "@/constants/symbol";
import { BaseBlock, Block, LUGEON_TEST_BLOCK_TYPE_ID } from "@/interfaces/Block";
import { LugeonTestBlock } from "@/interfaces/LugeonTestBlock";
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

export function checkAndReturnLugeonTestBlock({
    blocks,
    boreholeId,
    dayWorkStatus,
    topDepthInMetresStr,
    baseDepthInMetresStr,
}: Params): BaseBlock & LugeonTestBlock {

    dayWorkStatus = checkAndReturnDayWorkStatus(dayWorkStatus);
    
    if (isNaN(parseFloat(topDepthInMetresStr)) || parseFloat(topDepthInMetresStr) < 0) {
        throwError('Error: Top Depth');
    }
    if (isNaN(parseFloat(baseDepthInMetresStr)) || parseFloat(baseDepthInMetresStr) < parseFloat(topDepthInMetresStr)) {
        throwError('Error: Base Depth');
    }
    
    const topDepthInMetres: number = stringToDecimalPoint(topDepthInMetresStr, 3);
    const baseDepthInMetres: number = stringToDecimalPoint(baseDepthInMetresStr, 3);

    const lugeonTestIndex: number = blocks.filter((block: Block) => block.blockTypeId === LUGEON_TEST_BLOCK_TYPE_ID).length + 1;

    const newBlock: BaseBlock & LugeonTestBlock = {
        id: blocks.length + 1,
        blockId: blocks.length + 1,
        blockTypeId: LUGEON_TEST_BLOCK_TYPE_ID,
        symbol: LUGEON_TEST_SYMBOL,
        boreholeId: boreholeId, 
        lugeonTestIndex: lugeonTestIndex,
        dayWorkStatus: dayWorkStatus,
        topDepthInMetres: topDepthInMetres,
        baseDepthInMetres: baseDepthInMetres,
        description: 'Lugeon Test',
    };

    return newBlock;
}