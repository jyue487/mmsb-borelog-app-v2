import { DayWorkStatus } from "@/constants/DayWorkStatus";
import { VANE_SHEAR_TEST_SYMBOL } from "@/constants/symbol";
import { BaseBlock, Block, VANE_SHEAR_TEST_BLOCK_TYPE_ID } from "@/interfaces/Block";
import { VaneShearTestBlock } from "@/interfaces/VaneShearTestBlock";
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

export function checkAndReturnVaneShearTestBlock({
  boreholeId,
  dayWorkStatus,
  topDepthInMetresStr,
  baseDepthInMetresStr,
}: Params): BaseBlock & VaneShearTestBlock {

  checkAndReturnDayWorkStatus(dayWorkStatus);

  if (!stringIsNonNegativeFloat(topDepthInMetresStr)) {
    throwError('Error: Top Depth');
  }
  if (isNaN(parseFloat(baseDepthInMetresStr)) || parseFloat(baseDepthInMetresStr) < parseFloat(topDepthInMetresStr)) {
    throwError('Error: Base Depth');
  }

  const topDepthInMetres: number = stringToDecimalPoint(topDepthInMetresStr, 3);
  const baseDepthInMetres: number = stringToDecimalPoint(baseDepthInMetresStr, 3);

  const newBlock: Block = {
    id: randomUUID(),
    blockTypeId: VANE_SHEAR_TEST_BLOCK_TYPE_ID,
    symbol: VANE_SHEAR_TEST_SYMBOL,
    boreholeId: boreholeId,
    vaneShearTestIndex: 1,
    dayWorkStatus: dayWorkStatus,
    topDepthInMetres: topDepthInMetres,
    baseDepthInMetres: baseDepthInMetres,
    description: 'Vane Shear Test',
    createdAt: new Date(),
    updatedAt: null,
  };

  return newBlock;
}