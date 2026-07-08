import { DayWorkStatus } from "@/constants/DayWorkStatus";
import { RISING_HEAD_PERMEABILITY_TEST_SYMBOL } from "@/constants/symbol";
import { BaseBlock, Block, RISING_HEAD_PERMEABILITY_TEST_BLOCK_TYPE_ID } from "@/interfaces/Block";
import { RisingHeadPermeabilityTestBlock } from "@/interfaces/RisingHeadPermeabilityTestBlock";
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

export function checkAndReturnRisingHeadPermeabilityTestBlock({
  boreholeId,
  dayWorkStatus,
  topDepthInMetresStr,
  baseDepthInMetresStr,
}: Params): BaseBlock & RisingHeadPermeabilityTestBlock {

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

  const newBlock: BaseBlock & RisingHeadPermeabilityTestBlock = {
    id: randomUUID(),
    blockTypeId: RISING_HEAD_PERMEABILITY_TEST_BLOCK_TYPE_ID,
    symbol: RISING_HEAD_PERMEABILITY_TEST_SYMBOL,
    boreholeId: boreholeId,
    permeabilityTestIndex: -1,
    dayWorkStatus: dayWorkStatus,
    topDepthInMetres: topDepthInMetres,
    baseDepthInMetres: baseDepthInMetres,
    description: 'Rising Head Permeability Test',
    createdAt: new Date(),
    updatedAt: null,
  };

  return newBlock;
}