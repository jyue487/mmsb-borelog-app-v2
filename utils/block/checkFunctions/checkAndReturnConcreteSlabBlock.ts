import { DayWorkStatus } from "@/constants/DayWorkStatus";
import { BaseBlock, Block, CONCRETE_SLAB_BLOCK_TYPE_ID } from "@/interfaces/Block";
import { ConcreteSlabBlock } from "@/interfaces/ConcreteSlabBlock";
import { throwError } from "@/utils/error/throwError";
import { checkAndReturnDayWorkStatus } from "./checkAndReturnDayWorkStatus";
import { randomUUID } from "expo-crypto";
import { stringIsNonNegativeFloat, stringToDecimalPoint } from "@/utils/numbers";

type Params = {
  boreholeId: string;
  dayWorkStatus: DayWorkStatus;
  topDepthInMetresStr: string;
  baseDepthInMetresStr: string;
};

export function checkAndReturnConcreteSlabBlock({
  boreholeId,
  dayWorkStatus,
  topDepthInMetresStr,
  baseDepthInMetresStr,
}: Params): BaseBlock & ConcreteSlabBlock {

  dayWorkStatus = checkAndReturnDayWorkStatus(dayWorkStatus);

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
    blockTypeId: CONCRETE_SLAB_BLOCK_TYPE_ID,
    boreholeId: boreholeId,
    dayWorkStatus: dayWorkStatus,
    topDepthInMetres: topDepthInMetres,
    baseDepthInMetres: baseDepthInMetres,
    description: 'Concrete Slab',
    createdAt: new Date(),
    updatedAt: null,
  };

  return newBlock;
}