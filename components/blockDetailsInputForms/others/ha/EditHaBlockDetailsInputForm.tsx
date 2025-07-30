import React, { useState } from "react";
import { Button, type ViewProps } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { HaBlockInputQuestions } from "@/components/inputQuestions/HaBlockInputQuestions";
import { DayWorkStatus } from "@/constants/DayWorkStatus";
import { styles } from "@/constants/styles";
import { BaseBlock, Block } from "@/interfaces/Block";
import { ColourProperties } from "@/interfaces/ColourProperties";
import { HaBlock } from "@/interfaces/HaBlock";
import { SoilProperties } from "@/interfaces/SoilProperties";
import { checkAndReturnHaBlock } from "@/utils/checkFunctions/checkAndReturnHaBlock";

export type EditHaBlockDetailsInputFormProps = ViewProps & {
  blocks: Block[];
  setBlocks: React.Dispatch<React.SetStateAction<Block[]>>;
  oldBlock: BaseBlock & HaBlock;
  setIsEditState: React.Dispatch<React.SetStateAction<boolean>>;
};

export function EditHaBlockDetailsInputForm({ style, blocks, setBlocks, oldBlock, setIsEditState, ...otherProps }: EditHaBlockDetailsInputFormProps) {
  const [dayWorkStatus, setDayWorkStatus] = useState<DayWorkStatus>(oldBlock.dayWorkStatus);
  const [topDepthInMetresStr, setTopDepthInMetresStr] = useState<string>(oldBlock.topDepthInMetres.toFixed(3));
  const [baseDepthInMetresStr, setBaseDepthInMetresStr] = useState<string>(oldBlock.baseDepthInMetres.toFixed(3));
  const [requireSample, setRequireSample] = useState<boolean>(oldBlock.requireSample);
  const [colourProperties, setColourProperties] = useState<ColourProperties>(oldBlock.colourProperties);
  const [soilProperties, setSoilProperties] = useState<SoilProperties>(oldBlock.soilProperties);

  return (
    <GestureHandlerRootView style={styles.blockDetailsInputForm}>
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
            boreholeId: oldBlock.boreholeId,
            dayWorkStatus: dayWorkStatus,
            topDepthInMetresStr: topDepthInMetresStr,
            baseDepthInMetresStr: baseDepthInMetresStr,
            requireSample: requireSample,
            colourProperties: colourProperties,
            soilProperties: soilProperties,
          });
          setBlocks((blocks: Block[]) => blocks.map((b: Block) => (b === oldBlock) ? {...newBlock, id: b.id, blockId: b.blockId, haSampleIndex: b.haSampleIndex} : b));
          setIsEditState(false);
        }}
      />
      <Button 
        title='Cancel'
        onPress={() => setIsEditState(false)} 
      />
    </GestureHandlerRootView>
  );
}
