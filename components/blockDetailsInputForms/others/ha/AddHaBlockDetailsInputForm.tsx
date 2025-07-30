import React, { useState } from "react";
import { Button, type ViewProps } from "react-native";

import { HaBlockInputQuestions } from "@/components/inputQuestions/HaBlockInputQuestions";
import { DAY_CONTINUE_WORK_TYPE, DayWorkStatus } from "@/constants/DayWorkStatus";
import { Block } from "@/interfaces/Block";
import { ColourProperties } from "@/interfaces/ColourProperties";
import { SoilProperties } from "@/interfaces/SoilProperties";
import { checkAndReturnHaBlock } from "@/utils/checkFunctions/checkAndReturnHaBlock";

export type AddHaBlockDetailsInputFormProps = ViewProps & {
  boreholeId: number;
  blocks: Block[];
  setBlocks: React.Dispatch<React.SetStateAction<Block[]>>;
  setIsAddNewBlockButtonPressed: React.Dispatch<React.SetStateAction<boolean>>;
};

export function AddHaBlockDetailsInputForm({ style, boreholeId, blocks, setBlocks, setIsAddNewBlockButtonPressed, ...otherProps }: AddHaBlockDetailsInputFormProps) {
  const [dayWorkStatus, setDayWorkStatus] = useState<DayWorkStatus>({
    dayWorkStatusType: DAY_CONTINUE_WORK_TYPE,
    date: new Date(),
    time: new Date(),
    waterLevelInMetres: null,
    casingDepthInMetres: null,
  });
  const [topDepthInMetresStr, setTopDepthInMetresStr] = useState<string>('');
  const [baseDepthInMetresStr, setBaseDepthInMetresStr] = useState<string>('');
  const [requireSample, setRequireSample] = useState<boolean>(false);
  const [colourProperties, setColourProperties] = useState<ColourProperties>({
    dominantColour: null,
    secondaryColour: null,
  });
  const [soilProperties, setSoilProperties] = useState<SoilProperties>({
    dominantSoilType: null,
    secondarySoilType: null,
    otherProperties: '',
    customOtherProperties: '',
  });

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
      onPress={() => {
        const newBlock: Block = checkAndReturnHaBlock({
          blocks: blocks,
          boreholeId: boreholeId,
          dayWorkStatus: dayWorkStatus,
          topDepthInMetresStr: topDepthInMetresStr,
          baseDepthInMetresStr: baseDepthInMetresStr,
          requireSample: requireSample,
          colourProperties: colourProperties,
          soilProperties: soilProperties,
        });
        setBlocks(blocks => [...blocks, newBlock]);
        setIsAddNewBlockButtonPressed(false);
      }}
    />
    </>
  );
}
