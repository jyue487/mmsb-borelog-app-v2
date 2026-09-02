
import { BaseBlock, Block, CUSTOM_BLOCK_TYPE_ID, CustomBlock, DayWorkStatus } from '@mmsb/core';
import { checkAndReturnDayWorkStatus } from "@/src/utils/block/checkFunctions/checkAndReturnDayWorkStatus";
import { throwError } from "@/src/utils/error/throwError";
import { stringToDecimalPoint } from "@/src/utils/numbers";
import { randomUUID } from "expo-crypto";


type Params = {
  boreholeId: string;
  dayWorkStatus: DayWorkStatus;
  topDepthInMetresStr: string;
  baseDepthInMetresStr: string;
  customOperationType: string;
};

export function checkAndReturnCustomBlock({
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
  const baseDepthInMetres: number = (baseDepthInMetresStr.trim().length === 0) ? -1 : stringToDecimalPoint(baseDepthInMetresStr, 3);

  const newBlock: Block = {
    id: randomUUID(),
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