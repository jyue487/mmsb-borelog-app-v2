
import { BaseBlock, Block, CAVITY_BLOCK_TYPE_ID, CavityBlock, DayWorkStatus } from '@mmsb/core';
import { checkAndReturnDayWorkStatus } from "@/src/utils/block/checkFunctions/checkAndReturnDayWorkStatus";
import { throwError } from "@/src/utils/error/throwError";
import { stringIsNonNegativeFloat } from "@/src/utils/numbers";
import { randomUUID } from "expo-crypto";

type Params = {
    boreholeId: string;
    dayWorkStatus: DayWorkStatus;
    topDepthInMetresStr: string;
    baseDepthInMetresStr: string;
    description: string;
};

export function checkAndReturnCavityBlock({
    boreholeId,
    dayWorkStatus,
    topDepthInMetresStr,
    baseDepthInMetresStr,
    description,
}: Params): BaseBlock & CavityBlock {

    dayWorkStatus = checkAndReturnDayWorkStatus(dayWorkStatus);
    
    if (!stringIsNonNegativeFloat(topDepthInMetresStr)) {
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
        id: randomUUID(),
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