import {
  BaseBlock,
  DayWorkStatus,
  PRESSUREMETER_TEST_BLOCK_TYPE_ID,
  PRESSUREMETER_TEST_SYMBOL,
  PressuremeterTestBlock,
} from '@mmsb/core';
import { throwError } from "@/src/utils/error/throwError";
import { stringIsNonNegativeFloat, stringToDecimalPoint } from "@/src/utils/numbers";
import { randomUUID } from "expo-crypto";
import { checkAndReturnDayWorkStatus } from "./checkAndReturnDayWorkStatus";

type Params = {
  boreholeId: string;
  dayWorkStatus: DayWorkStatus;
  topDepthInMetresStr: string;
  baseDepthInMetresStr: string;
};

export function checkAndReturnPressuremeterTestBlock({
  boreholeId,
  dayWorkStatus,
  topDepthInMetresStr,
  baseDepthInMetresStr,
}: Params): BaseBlock & PressuremeterTestBlock {

  dayWorkStatus = checkAndReturnDayWorkStatus(dayWorkStatus);

  if (!stringIsNonNegativeFloat(topDepthInMetresStr)) {
    throwError('Error: Top Depth');
  }
  if (isNaN(parseFloat(baseDepthInMetresStr)) || parseFloat(baseDepthInMetresStr) < parseFloat(topDepthInMetresStr)) {
    throwError('Error: Base Depth');
  }

  const topDepthInMetres: number = stringToDecimalPoint(topDepthInMetresStr, 3);
  const baseDepthInMetres: number = stringToDecimalPoint(baseDepthInMetresStr, 3);

  const newBlock: BaseBlock & PressuremeterTestBlock = {
    id: randomUUID(),
    blockTypeId: PRESSUREMETER_TEST_BLOCK_TYPE_ID,
    symbol: PRESSUREMETER_TEST_SYMBOL,
    boreholeId: boreholeId,
    pressuremeterTestIndex: -1,
    dayWorkStatus: dayWorkStatus,
    topDepthInMetres: topDepthInMetres,
    baseDepthInMetres: baseDepthInMetres,
    description: 'Pressuremeter Test',
    createdAt: new Date(),
    updatedAt: null,
  };

  return newBlock;
}