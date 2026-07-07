import React, { useState } from "react";
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

export function HaBlockDetailsInputForm({ boreholeId, inputBlock, onSubmitAsync, ...otherProps }: SpecificBlockDetailsInputFormProps) {
  const block: BaseBlock & HaBlock = (inputBlock !== null && inputBlock.blockTypeId === HA_BLOCK_TYPE_ID) ? inputBlock : createDefaultHaBlock();
  const [dayWorkStatus, setDayWorkStatus] = useState<DayWorkStatus>(block.dayWorkStatus);
  const [topDepthInMetresStr, setTopDepthInMetresStr] = useState<string>(block.topDepthInMetres.toFixed(3));
  const [baseDepthInMetresStr, setBaseDepthInMetresStr] = useState<string>(block.baseDepthInMetres.toFixed(3));
  const [requireSample, setRequireSample] = useState<boolean>(block.requireSample);
  const [colourProperties, setColourProperties] = useState<ColourProperties>(block.colourProperties);
  const [soilProperties, setSoilProperties] = useState<SoilProperties>(block.soilProperties);

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
      <Button
        title='Confirm'
        color={styles.confirmButton.color}
        onPress={async () => {
          const newBlock: Block = checkAndReturnHaBlock({
            boreholeId: boreholeId,
            dayWorkStatus: dayWorkStatus,
            topDepthInMetresStr: topDepthInMetresStr,
            baseDepthInMetresStr: baseDepthInMetresStr,
            requireSample: requireSample,
            colourProperties: colourProperties,
            soilProperties: soilProperties,
          });
          await onSubmitAsync(newBlock);
        }}
      />
    </>
  );
}
