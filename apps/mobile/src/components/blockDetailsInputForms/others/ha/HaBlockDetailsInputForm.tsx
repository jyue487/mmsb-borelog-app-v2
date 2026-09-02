import React, { useEffect, useState } from "react";

import { SpecificBlockDetailsInputFormProps } from "@/src/components/blockDetailsInputForms/BlockDetailsInputForm";
import { HaBlockInputQuestions } from "@/src/components/inputQuestions/HaBlockInputQuestions";
import {
  BaseBlock,
  ColourProperties,
  createDefaultHaBlock,
  DayWorkStatus,
  HA_BLOCK_TYPE_ID,
  HaBlock,
  SoilProperties,
} from '@mmsb/core';
import { checkAndReturnHaBlock } from "@/src/utils/block/checkFunctions/checkAndReturnHaBlock";
import { depthInMetresToString } from "@/src/utils/depth";

export function HaBlockDetailsInputForm({ boreholeId, inputBlock, setCheckAndReturnBlock, ...otherProps }: SpecificBlockDetailsInputFormProps) {
  const block: BaseBlock & HaBlock = (inputBlock !== null && inputBlock.blockTypeId === HA_BLOCK_TYPE_ID) ? inputBlock : createDefaultHaBlock();
  const [dayWorkStatus, setDayWorkStatus] = useState<DayWorkStatus>(block.dayWorkStatus);
  const [topDepthInMetresStr, setTopDepthInMetresStr] = useState<string>(depthInMetresToString(block.topDepthInMetres));
  const [baseDepthInMetresStr, setBaseDepthInMetresStr] = useState<string>(depthInMetresToString(block.baseDepthInMetres));
  const [requireSample, setRequireSample] = useState<boolean>(block.requireSample);
  const [colourProperties, setColourProperties] = useState<ColourProperties>(block.colourProperties);
  const [soilProperties, setSoilProperties] = useState<SoilProperties>(block.soilProperties);

  useEffect(() => {
    setCheckAndReturnBlock(() => () => {
      return checkAndReturnHaBlock({
        boreholeId: boreholeId,
        dayWorkStatus: dayWorkStatus,
        topDepthInMetresStr: topDepthInMetresStr,
        baseDepthInMetresStr: baseDepthInMetresStr,
        requireSample: requireSample,
        colourProperties: colourProperties,
        soilProperties: soilProperties,
      });
    });
  }, [
    boreholeId,
    dayWorkStatus,
    topDepthInMetresStr,
    baseDepthInMetresStr,
    requireSample,
    colourProperties,
    soilProperties,
  ]);

  return (
    <>
      <HaBlockInputQuestions
        dayWorkStatus={dayWorkStatus} setDayWorkStatus={setDayWorkStatus}
        topDepthInMetresStr={topDepthInMetresStr} setTopDepthInMetresStr={setTopDepthInMetresStr}
        baseDepthInMetresStr={baseDepthInMetresStr} setBaseDepthInMetresStr={setBaseDepthInMetresStr}
        requireSample={requireSample} setRequireSample={setRequireSample}
        colourProperties={colourProperties} setColourProperties={setColourProperties}
        soilProperties={soilProperties} setSoilProperties={setSoilProperties}
      />
    </>
  );
}
