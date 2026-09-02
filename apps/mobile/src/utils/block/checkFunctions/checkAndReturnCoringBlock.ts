
import {
  BaseBlock,
  Block,
  ColourProperties,
  CORING_BLOCK_TYPE_ID,
  CoringBlock,
  DayWorkStatus,
  RockProperties,
} from '@mmsb/core';
import { checkAndReturnDayWorkStatus } from "@/src/utils/block/checkFunctions/checkAndReturnDayWorkStatus";
import { throwError } from "@/src/utils/error/throwError";
import { stringIsNonNegativeFloat, stringToDecimalPoint } from "@/src/utils/numbers";
import { randomUUID } from "expo-crypto";
import { checkAndReturnCoringBlockDescription } from "./checkAndReturnCoringBlockDescription";

type Params = {
  boreholeId: string;
  dayWorkStatus: DayWorkStatus;
  topDepthInMetresStr: string;
  coreRunInMetresStr: string;
  coreRecoveryInMetresStr: string;
  rqdInMetresStr: string;
  colourProperties: ColourProperties;
  rockProperties: RockProperties;
};

export function checkAndReturnCoringBlock({
  boreholeId,
  dayWorkStatus,
  topDepthInMetresStr,
  coreRunInMetresStr,
  coreRecoveryInMetresStr,
  rqdInMetresStr,
  colourProperties,
  rockProperties,
}: Params): BaseBlock & CoringBlock {

  dayWorkStatus = checkAndReturnDayWorkStatus(dayWorkStatus);

  if (!stringIsNonNegativeFloat(topDepthInMetresStr)) {
    throwError('Error: Top Depth');
  }
  if (!stringIsNonNegativeFloat(coreRunInMetresStr)) {
    throwError('Error: Core Run');
  }
  if (!stringIsNonNegativeFloat(coreRecoveryInMetresStr)) {
    throwError('Error: Core Recovery');
  }
  if (stringToDecimalPoint(coreRecoveryInMetresStr, 3) > 0 && !stringIsNonNegativeFloat(rqdInMetresStr)) {
    throwError('Error: R.Q.D.');
  }

  const topDepthInMetres: number = stringToDecimalPoint(topDepthInMetresStr, 3);
  const topDepthInMillimetres: number = topDepthInMetres * 1000;
  const coreRunInMetres: number = stringToDecimalPoint(coreRunInMetresStr, 3);
  const coreRunInMillimetres: number = coreRunInMetres * 1000;
  const coreRecoveryInMetres: number = stringToDecimalPoint(coreRecoveryInMetresStr, 3);
  const coreRecoveryInMillimetres: number = coreRecoveryInMetres * 1000;
  const coreRecoveryInPercentage: number = parseFloat((coreRecoveryInMillimetres / coreRunInMillimetres * 100).toFixed(1));
  const baseDepthInMetres: number = (topDepthInMillimetres + coreRunInMillimetres) / 1000;
  const rqdInMetres: number = (coreRecoveryInPercentage === 0) ? 0 : stringToDecimalPoint(rqdInMetresStr, 3);
  const rqdInMillimetres: number = rqdInMetres * 1000;
  const rqdInPercentage = parseFloat((rqdInMillimetres / coreRunInMillimetres * 100).toFixed(1));

  const description: string = checkAndReturnCoringBlockDescription(
    coreRecoveryInPercentage,
    rqdInPercentage,
    colourProperties,
    rockProperties,
  );

  const newCoringBlock: Block = {
    id: randomUUID(),
    blockTypeId: CORING_BLOCK_TYPE_ID,
    boreholeId: boreholeId,
    rockSampleIndex: -1,
    dayWorkStatus: dayWorkStatus,
    topDepthInMetres: topDepthInMetres,
    baseDepthInMetres: baseDepthInMetres,
    description: description,
    coreRunInMetres: coreRunInMetres,
    coreRecoveryInPercentage: coreRecoveryInPercentage,
    rqdInPercentage: rqdInPercentage,
    coreRecoveryInMetres: coreRecoveryInMetres,
    rqdInMetres: rqdInMetres,
    colourProperties: colourProperties,
    rockProperties: rockProperties,
    createdAt: new Date(),
    updatedAt: null,
  };
  return newCoringBlock;
}