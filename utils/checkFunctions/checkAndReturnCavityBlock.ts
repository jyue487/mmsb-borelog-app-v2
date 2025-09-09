
import { DayWorkStatus } from "@/constants/DayWorkStatus";
import { BaseBlock, Block, CAVITY_BLOCK_TYPE_ID } from "@/interfaces/Block";
import { CavityBlock } from "@/interfaces/CavityBlock";
import { checkAndReturnDayWorkStatus } from "@/utils/checkFunctions/checkAndReturnDayWorkStatus";
import { throwError } from "../error/throwError";

type Params = {
    blocks: Block[];
    boreholeId: number;
    dayWorkStatus: DayWorkStatus;
    topDepthInMetresStr: string;
    baseDepthInMetresStr: string;
    description: string;
};

export function checkAndReturnCavityBlock({
    blocks,
    boreholeId,
    dayWorkStatus,
    topDepthInMetresStr,
    baseDepthInMetresStr,
    description,
}: Params): BaseBlock & CavityBlock {

    dayWorkStatus = checkAndReturnDayWorkStatus(dayWorkStatus);
    
    if (isNaN(parseFloat(topDepthInMetresStr)) || parseFloat(topDepthInMetresStr) < 0) {
        throwError('Error: Top Depth');
    }
    if (isNaN(parseFloat(baseDepthInMetresStr)) || parseFloat(baseDepthInMetresStr) < parseFloat(topDepthInMetresStr)) {
        throwError('Error: Base Depth');
    }
    if (!description) {
        throwError('Error: Cavity Description');
    }

    const topDepthInMetres: number = parseFloat(parseFloat(topDepthInMetresStr).toFixed(3));
    const baseDepthInMetres: number = parseFloat(parseFloat(baseDepthInMetresStr).toFixed(3));

    const newBlock: Block = {
        id: blocks.length + 1,
        blockTypeId: CAVITY_BLOCK_TYPE_ID,
        boreholeId: boreholeId, 
        dayWorkStatus: dayWorkStatus,
        topDepthInMetres: topDepthInMetres,
        baseDepthInMetres: baseDepthInMetres,
        description: description,
        createdAt: new Date(),
        updatedAt: null,
    };

    return newBlock;
}