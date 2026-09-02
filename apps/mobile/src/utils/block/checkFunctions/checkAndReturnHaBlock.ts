import {
  BaseBlock,
  Block,
  ColourProperties,
  DayWorkStatus,
  HA_BLOCK_TYPE_ID,
  HaBlock,
  SoilProperties,
} from '@mmsb/core';
import { throwError } from "@/src/utils/error/throwError";
import { stringIsNonNegativeFloat, stringToDecimalPoint } from "@/src/utils/numbers";
import { randomUUID } from "expo-crypto";
import { checkAndReturnDayWorkStatus } from "./checkAndReturnDayWorkStatus";
import { checkAndReturnHaBlockDescription } from "./checkAndReturnHaBlockDescription";

type Params = {
  boreholeId: string;
  dayWorkStatus: DayWorkStatus;
  topDepthInMetresStr: string;
  baseDepthInMetresStr: string;
  requireSample: boolean;
  colourProperties: ColourProperties;
  soilProperties: SoilProperties;
};

export function checkAndReturnHaBlock({
  boreholeId,
  dayWorkStatus,
  topDepthInMetresStr,
  baseDepthInMetresStr,
  requireSample,
  colourProperties,
  soilProperties,
}: Params): BaseBlock & HaBlock {

  dayWorkStatus = checkAndReturnDayWorkStatus(dayWorkStatus);

  if (!stringIsNonNegativeFloat(topDepthInMetresStr)) {
    throwError('Error: Top Depth');
  }
  if (isNaN(parseFloat(baseDepthInMetresStr)) || parseFloat(baseDepthInMetresStr) < parseFloat(topDepthInMetresStr)) {
    throwError('Error: Base Depth');
  }

  const description: string = checkAndReturnHaBlockDescription(requireSample, colourProperties, soilProperties);
  const topDepthInMetres: number = stringToDecimalPoint(topDepthInMetresStr, 3);
  const baseDepthInMetres: number = stringToDecimalPoint(baseDepthInMetresStr, 3);

  const newBlock: Block = {
    id: randomUUID(),
    blockTypeId: HA_BLOCK_TYPE_ID,
    boreholeId: boreholeId,
    haSampleIndex: -1,
    dayWorkStatus: dayWorkStatus,
    topDepthInMetres: topDepthInMetres,
    baseDepthInMetres: baseDepthInMetres,
    description: description,
    requireSample: requireSample,
    colourProperties: colourProperties,
    soilProperties: soilProperties,
    createdAt: new Date(),
    updatedAt: null,
  };

  return newBlock;
}