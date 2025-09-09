
import { DayWorkStatus } from "@/constants/DayWorkStatus";
import { BaseBlock, Block, CUSTOM_BLOCK_TYPE_ID } from "@/interfaces/Block";
import { CustomBlock } from "@/interfaces/CustomBlock";
import { checkAndReturnDayWorkStatus } from "@/utils/checkFunctions/checkAndReturnDayWorkStatus";
import { stringToDecimalPoint } from "@/utils/numbers";
import { throwError } from "../error/throwError";


type Params = {
    blocks: Block[];
    boreholeId: number;
    dayWorkStatus: DayWorkStatus;
    topDepthInMetresStr: string;
    baseDepthInMetresStr: string;
    customOperationType: string;
};

export function checkAndReturnCustomBlock({
    blocks,
    boreholeId,
    dayWorkStatus,
    topDepthInMetresStr,
    baseDepthInMetresStr,
    customOperationType,
}: Params): BaseBlock & CustomBlock {

    dayWorkStatus = checkAndReturnDayWorkStatus(dayWorkStatus);
    
    if (topDepthInMetresStr.trim().length > 0) {
        if (isNaN(parseFloat(topDepthInMetresStr)) || parseFloat(topDepthInMetresStr) < 0) {
            throwError('Error: Top Depth');
        }
    }
    if (baseDepthInMetresStr.trim().length > 0) {
        if (isNaN(parseFloat(baseDepthInMetresStr)) || parseFloat(baseDepthInMetresStr) < parseFloat(topDepthInMetresStr)) {
            throwError('Error: Base Depth');
        }
    }
    if (customOperationType.trim().length === 0) {
        throwError('Error: Custom Operation');
    }

    const topDepthInMetres: number = (topDepthInMetresStr.trim().length === 0) ? -1 : stringToDecimalPoint(topDepthInMetresStr, 3);
    const baseDepthInMetres: number = (baseDepthInMetresStr.trim().length === 0) ? -1 :  stringToDecimalPoint(baseDepthInMetresStr, 3);

    const newBlock: Block = {
        id: blocks.length + 1,
        blockTypeId: CUSTOM_BLOCK_TYPE_ID,
        boreholeId: boreholeId, 
        dayWorkStatus: dayWorkStatus,
        topDepthInMetres: topDepthInMetres,
        baseDepthInMetres: baseDepthInMetres,
        description: customOperationType.trim(),
        createdAt: new Date(),
        updatedAt: null,
    };

    return newBlock;
}