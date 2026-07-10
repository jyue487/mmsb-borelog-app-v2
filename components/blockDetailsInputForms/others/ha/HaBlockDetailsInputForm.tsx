import React, { useEffect, useState } from "react";
import { Button, View, type ViewProps } from "react-native";

import { HaBlockInputQuestions } from "@/components/inputQuestions/HaBlockInputQuestions";
import { DayWorkStatus } from "@/constants/DayWorkStatus";
import { styles } from "@/constants/styles";
import { BaseBlock, Block, HA_BLOCK_TYPE_ID } from "@/interfaces/Block";
import { ColourProperties } from "@/interfaces/ColourProperties";
import { createDefaultHaBlock, HaBlock } from "@/interfaces/HaBlock";
import { SoilProperties } from "@/interfaces/SoilProperties";
import { checkAndReturnHaBlock } from "@/utils/block/checkFunctions/checkAndReturnHaBlock";
import { SpecificBlockDetailsInputFormProps } from "@/components/blockDetailsInputForms/BlockDetailsInputForm";
import { depthInMetresToString } from "@/utils/depth";

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
