import React, { useEffect, useState } from "react";

import { CavityBlockInputQuestions } from "@/src/components/inputQuestions/CavityBlockInputQuestions";
import {
  BaseBlock,
  CAVITY_BLOCK_TYPE_ID,
  CavityBlock,
  createDefaultCavityBlock,
  DayWorkStatus,
} from '@mmsb/core';
import { checkAndReturnCavityBlock } from "@/src/utils/block/checkFunctions/checkAndReturnCavityBlock";
import { depthInMetresToString } from "@/src/utils/depth";
import { SpecificBlockDetailsInputFormProps } from "../../BlockDetailsInputForm";

export function CavityBlockDetailsInputForm({ boreholeId, inputBlock, setCheckAndReturnBlock, ...otherProps }: SpecificBlockDetailsInputFormProps) {
  const block: BaseBlock & CavityBlock = (inputBlock !== null && inputBlock.blockTypeId === CAVITY_BLOCK_TYPE_ID) ? inputBlock : createDefaultCavityBlock();
  const [dayWorkStatus, setDayWorkStatus] = useState<DayWorkStatus>(block.dayWorkStatus);
  const [topDepthInMetresStr, setTopDepthInMetresStr] = useState<string>(depthInMetresToString(block.topDepthInMetres));
  const [baseDepthInMetresStr, setBaseDepthInMetresStr] = useState<string>(depthInMetresToString(block.baseDepthInMetres));
  const [description, setDescription] = useState<string>(block.description);

  useEffect(() => {
    setCheckAndReturnBlock(() => () => {
      return checkAndReturnCavityBlock({
        boreholeId: boreholeId,
        dayWorkStatus: dayWorkStatus,
        topDepthInMetresStr: topDepthInMetresStr,
        baseDepthInMetresStr: baseDepthInMetresStr,
        description: description,
      });
    });
  }, [
    boreholeId,
    dayWorkStatus,
    topDepthInMetresStr,
    baseDepthInMetresStr,
    description,
  ]);

  return (
    <>
      <CavityBlockInputQuestions
        dayWorkStatus={dayWorkStatus} setDayWorkStatus={setDayWorkStatus}
        topDepthInMetresStr={topDepthInMetresStr} setTopDepthInMetresStr={setTopDepthInMetresStr}
        baseDepthInMetresStr={baseDepthInMetresStr} setBaseDepthInMetresStr={setBaseDepthInMetresStr}
        description={description} setDescription={setDescription}
      />
    </>
  );
}
