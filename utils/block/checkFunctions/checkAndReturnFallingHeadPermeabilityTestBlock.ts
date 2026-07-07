import { DayWorkStatus } from "@/constants/DayWorkStatus";
import { FALLING_HEAD_PERMEABILITY_TEST_SYMBOL } from "@/constants/symbol";
import { BaseBlock, Block, FALLING_HEAD_PERMEABILITY_TEST_BLOCK_TYPE_ID } from "@/interfaces/Block";
import { FallingHeadPermeabilityTestBlock } from "@/interfaces/FallingHeadPermeabilityTestBlock";
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

export function checkAndReturnFallingHeadPermeabilityTestBlock({
  boreholeId,
  dayWorkStatus,
  topDepthInMetresStr,
  baseDepthInMetresStr,
}: Params): BaseBlock & FallingHeadPermeabilityTestBlock {

  dayWorkStatus = checkAndReturnDayWorkStatus(dayWorkStatus);

  if (!stringIsNonNegativeFloat(topDepthInMetresStr)) {
    throwError('Error: Top Depth');
  }
  if (baseDepthInMetresStr.trim().length > 0) {
    if (isNaN(parseFloat(baseDepthInMetresStr)) || parseFloat(baseDepthInMetresStr) < parseFloat(topDepthInMetresStr)) {
      throwError('Error: Base Depth');
    }
  }

  const topDepthInMetres: number = stringToDecimalPoint(topDepthInMetresStr, 3);
  const baseDepthInMetres: number = (baseDepthInMetresStr.trim().length === 0) ? topDepthInMetres : stringToDecimalPoint(baseDepthInMetresStr, 3);

  const newBlock: BaseBlock & FallingHeadPermeabilityTestBlock = {
    id: randomUUID(),
    blockTypeId: FALLING_HEAD_PERMEABILITY_TEST_BLOCK_TYPE_ID,
    symbol: FALLING_HEAD_PERMEABILITY_TEST_SYMBOL,
    boreholeId: boreholeId,
    permeabilityTestIndex: -1,
    dayWorkStatus: dayWorkStatus,
    topDepthInMetres: topDepthInMetres,
    baseDepthInMetres: baseDepthInMetres,
    description: 'Falling Head Permeability Test',
    createdAt: new Date(),
    updatedAt: null,
  };

  return newBlock;
}