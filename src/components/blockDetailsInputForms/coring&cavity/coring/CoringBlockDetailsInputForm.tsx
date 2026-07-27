import React, { useEffect, useState } from "react";

import { DayWorkStatus } from "@/src/constants/DayWorkStatus";
import { BaseBlock, CORING_BLOCK_TYPE_ID } from "@/src/interfaces/Block";
import { ColourProperties } from "@/src/interfaces/ColourProperties";
import { CoringBlock, createDefaultCoringBlock } from "@/src/interfaces/CoringBlock";
import { RockProperties } from "@/src/interfaces/RockProperties";
import { checkAndReturnCoringBlock } from "@/src/utils/block/checkFunctions/checkAndReturnCoringBlock";
import { depthInMetresToString } from "@/src/utils/depth";
import { isNonNegative, roundToDecimalPoint } from "@/src/utils/numbers";
import { CoringBlockInputQuestions } from "../../../inputQuestions/CoringBlockInputQuestions";
import { SpecificBlockDetailsInputFormProps } from "../../BlockDetailsInputForm";

export function CoringBlockDetailsInputForm({ boreholeId, inputBlock, setCheckAndReturnBlock, ...otherProps }: SpecificBlockDetailsInputFormProps) {
  const block: BaseBlock & CoringBlock = (inputBlock !== null && inputBlock.blockTypeId === CORING_BLOCK_TYPE_ID) ? inputBlock : createDefaultCoringBlock();
  const [dayWorkStatus, setDayWorkStatus] = useState<DayWorkStatus>(block.dayWorkStatus);
  const [topDepthInMetresStr, setTopDepthInMetresStr] = useState<string>(depthInMetresToString(block.topDepthInMetres));
  const [coreRunInMetresStr, setCoreRunInMetresStr] = useState<string>(isNonNegative(block.coreRunInMetres) ? roundToDecimalPoint(block.coreRunInMetres, 3).toString() : '');
  const [coreRecoveryInMetresStr, setCoreRecoveryInMetresStr] = useState<string>(isNonNegative(block.coreRecoveryInMetres) ? roundToDecimalPoint(block.coreRecoveryInMetres, 3).toString() : '');
  const [rqdInMetresStr, setRqdInMetresStr] = useState<string>(isNonNegative(block.rqdInMetres) ? roundToDecimalPoint(block.rqdInMetres, 3).toString() : '');
  const [colourProperties, setColourProperties] = useState<ColourProperties>(block.colourProperties);
  const [rockProperties, setRockProperties] = useState<RockProperties>(block.rockProperties);

  useEffect(() => {
    setCheckAndReturnBlock(() => () => {
      return checkAndReturnCoringBlock({
        boreholeId: boreholeId,
        dayWorkStatus: dayWorkStatus,
        topDepthInMetresStr: topDepthInMetresStr,
        coreRunInMetresStr: coreRunInMetresStr,
        coreRecoveryInMetresStr: coreRecoveryInMetresStr,
        rqdInMetresStr: rqdInMetresStr,
        colourProperties: colourProperties,
        rockProperties: rockProperties,
      });
    })
  }, [
    boreholeId,
    dayWorkStatus,
    topDepthInMetresStr,
    coreRunInMetresStr,
    coreRecoveryInMetresStr,
    rqdInMetresStr,
    colourProperties,
    rockProperties,
  ]);

  return (
    <>
      <CoringBlockInputQuestions
        dayWorkStatus={dayWorkStatus} setDayWorkStatus={setDayWorkStatus}
        topDepthInMetresStr={topDepthInMetresStr} setTopDepthInMetresStr={setTopDepthInMetresStr}
        coreRunInMetresStr={coreRunInMetresStr} setCoreRunInMetresStr={setCoreRunInMetresStr}
        coreRecoveryInMetresStr={coreRecoveryInMetresStr} setCoreRecoveryInMetresStr={setCoreRecoveryInMetresStr}
        rqdInMetresStr={rqdInMetresStr} setRqdInMetresStr={setRqdInMetresStr}
        colourProperties={colourProperties} setColourProperties={setColourProperties}
        rockProperties={rockProperties} setRockProperties={setRockProperties}
      />
    </>
  );
}
