import { DayWorkStatus } from "@/constants/DayWorkStatus";
import { LUGEON_TEST_SYMBOL } from "@/constants/symbol";
import { BaseBlock, Block, LUGEON_TEST_BLOCK_TYPE_ID } from "@/interfaces/Block";
import { LugeonTestBlock } from "@/interfaces/LugeonTestBlock";
import { throwError } from "@/utils/error/throwError";
import { stringIsNonNegativeFloat, stringToDecimalPoint } from "@/utils/numbers";
import { checkAndReturnDayWorkStatus } from "./checkAndReturnDayWorkStatus";
import { randomUUID } from "expo-crypto";

type Params = {
  boreholeId: string;
  dayWorkStatus: DayWorkStatus;
  topDepthInMetresStr: string;
  baseDepthInMetresStr: string;
};

export function checkAndReturnLugeonTestBlock({
  boreholeId,
  dayWorkStatus,
  topDepthInMetresStr,
  baseDepthInMetresStr,
}: Params): BaseBlock & LugeonTestBlock {

  dayWorkStatus = checkAndReturnDayWorkStatus(dayWorkStatus);

  if (!stringIsNonNegativeFloat(topDepthInMetresStr)) {
    throwError('Error: Top Depth');
  }
  if (isNaN(parseFloat(baseDepthInMetresStr)) || parseFloat(baseDepthInMetresStr) < parseFloat(topDepthInMetresStr)) {
    throwError('Error: Base Depth');
  }

  const topDepthInMetres: number = stringToDecimalPoint(topDepthInMetresStr, 3);
  const baseDepthInMetres: number = stringToDecimalPoint(baseDepthInMetresStr, 3);

  const newBlock: BaseBlock & LugeonTestBlock = {
    id: randomUUID(),
    blockTypeId: LUGEON_TEST_BLOCK_TYPE_ID,
    symbol: LUGEON_TEST_SYMBOL,
    boreholeId: boreholeId,
    lugeonTestIndex: -1,
    dayWorkStatus: dayWorkStatus,
    topDepthInMetres: topDepthInMetres,
    baseDepthInMetres: baseDepthInMetres,
    description: 'Lugeon Test',
    createdAt: new Date(),
    updatedAt: null,
  };

  return newBlock;
}