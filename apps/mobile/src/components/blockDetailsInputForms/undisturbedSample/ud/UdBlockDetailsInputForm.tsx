import React, { useEffect, useState } from "react";

import { SpecificBlockDetailsInputFormProps } from "@/src/components/blockDetailsInputForms/BlockDetailsInputForm";
import { UndisturbedSampleInputQuestions } from "@/src/components/inputQuestions/UndisturbedSampleInputQuestions";
import {
  BaseBlock,
  ColourProperties,
  createDefaultUdBlock,
  DayWorkStatus,
  SoilProperties,
  UD_BLOCK_TYPE_ID,
  UdBlock,
} from '@mmsb/core';
import { checkAndReturnUndisturbedSampleBlock } from "@/src/utils/block/checkFunctions/checkAndReturnUndisturbedSampleBlock";
import { depthInMetresToString } from "@/src/utils/depth";
import { isNonNegative, roundToDecimalPoint } from "@/src/utils/numbers";

export function UdBlockDetailsInputForm({ boreholeId, inputBlock, setCheckAndReturnBlock, ...otherProps }: SpecificBlockDetailsInputFormProps) {
  const block: BaseBlock & UdBlock = (inputBlock !== null && inputBlock.blockTypeId === UD_BLOCK_TYPE_ID) ? inputBlock : createDefaultUdBlock();
  const [dayWorkStatus, setDayWorkStatus] = useState<DayWorkStatus>(block.dayWorkStatus);
  const [topDepthInMetresStr, setTopDepthInMetresStr] = useState<string>(depthInMetresToString(block.topDepthInMetres));
  const [penetrationDepthInMetresStr, setPenetrationDepthInMetresStr] = useState<string>(isNonNegative(block.penetrationDepthInMetres) ? roundToDecimalPoint(block.penetrationDepthInMetres, 3).toString() : '');
  const [recoveryLengthInMetresStr, setRecoveryLengthInMetresStr] = useState<string>(isNonNegative(block.recoveryLengthInMetres) ? roundToDecimalPoint(block.recoveryLengthInMetres, 3).toString() : '');
  const [topColourProperties, setTopColourProperties] = useState<ColourProperties>(block.topColourProperties);
  const [topSoilProperties, setTopSoilProperties] = useState<SoilProperties>(block.topSoilProperties);
  const [baseDitto, setBaseDitto] = useState<boolean>(block.baseDitto);
  const [bottomColourProperties, setBottomColourProperties] = useState<ColourProperties>(block.bottomColourProperties);
  const [bottomSoilProperties, setBottomSoilProperties] = useState<SoilProperties>(block.bottomSoilProperties);

  useEffect(() => {
    setCheckAndReturnBlock(() => () => {
      return checkAndReturnUndisturbedSampleBlock({
        undisturbedSampleBlockTypeId: UD_BLOCK_TYPE_ID,
        boreholeId: boreholeId,
        dayWorkStatus: dayWorkStatus,
        topDepthInMetresStr: topDepthInMetresStr,
        penetrationDepthInMetresStr: penetrationDepthInMetresStr,
        recoveryLengthInMetresStr: recoveryLengthInMetresStr,
        topColourProperties: topColourProperties,
        topSoilProperties: topSoilProperties,
        baseDitto: baseDitto,
        bottomColourProperties: bottomColourProperties,
        bottomSoilProperties: bottomSoilProperties,
      });
    });
  }, [
    boreholeId,
    dayWorkStatus,
    topDepthInMetresStr,
    penetrationDepthInMetresStr,
    recoveryLengthInMetresStr,
    topColourProperties,
    topSoilProperties,
    baseDitto,
    bottomColourProperties,
    bottomSoilProperties,
  ]);

  return (
    <>
      <UndisturbedSampleInputQuestions
        dayWorkStatus={dayWorkStatus} setDayWorkStatus={setDayWorkStatus}
        topDepthInMetresStr={topDepthInMetresStr} setTopDepthInMetresStr={setTopDepthInMetresStr}
        penetrationDepthInMetresStr={penetrationDepthInMetresStr} setPenetrationDepthInMetresStr={setPenetrationDepthInMetresStr}
        recoveryLengthInMetresStr={recoveryLengthInMetresStr} setRecoveryLengthInMetresStr={setRecoveryLengthInMetresStr}
        topColourProperties={topColourProperties} setTopColourProperties={setTopColourProperties}
        topSoilProperties={topSoilProperties} setTopSoilProperties={setTopSoilProperties}
        baseDitto={baseDitto} setBaseDitto={setBaseDitto}
        bottomColourProperties={bottomColourProperties} setBottomColourProperties={setBottomColourProperties}
        bottomSoilProperties={bottomSoilProperties} setBottomSoilProperties={setBottomSoilProperties}
      />
    </>
  );
}
