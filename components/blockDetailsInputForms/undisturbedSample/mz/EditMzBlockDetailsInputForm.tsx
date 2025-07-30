import React, { useState } from "react";
import { Button, Keyboard, Text, TextInput, TouchableOpacity, View, type ViewProps } from "react-native";
import { FlatList, GestureHandlerRootView } from "react-native-gesture-handler";

import { DayWorkStatusInputQuestions } from '@/components/inputQuestions/DayWorkStatusInputQuestions';
import { DAY_CONTINUE_WORK_TYPE, DayWorkStatus, DayWorkStatusType } from "@/constants/DayWorkStatus";
import { Colour } from "@/constants/colour";
import {
    DominantSoilType,
    SecondarySoilType
} from "@/constants/soil";
import { styles } from "@/constants/styles";
import { BaseBlock, Block, MZ_BLOCK_TYPE_ID } from "@/interfaces/Block";
import { MzBlock } from "@/interfaces/MzBlock";
import { checkAndReturnDayWorkStatus } from "@/utils/checkFunctions/checkAndReturnDayWorkStatus";
import { checkAndReturnUndisturbedSampleDescription } from "@/utils/checkFunctions/checkAndReturnUndisturbedSampleDescription";
import { roundToDecimalPoint, stringIsNonNegativeFloat, stringToDecimalPoint } from "@/utils/numbers";
import { SoilPropertiesInputQuestions } from "../../../inputQuestions/SoilPropertiesInputQuestions";
import { UndisturbedSampleInputQuestions } from "@/components/inputQuestions/UndisturbedSampleInputQuestions";
import { checkAndReturnUndisturbedSampleBlock } from "@/utils/checkFunctions/checkAndReturnUndisturbedSampleBlock";
import { ColourProperties } from "@/interfaces/ColourProperties";
import { SoilProperties } from "@/interfaces/SoilProperties";

export type EditMzBlockDetailsInputFormProps = ViewProps & {
  blocks: Block[];
  setBlocks: React.Dispatch<React.SetStateAction<Block[]>>;
  oldBlock: BaseBlock & MzBlock;
  setIsEditState: React.Dispatch<React.SetStateAction<boolean>>;
};

export function EditMzBlockDetailsInputForm({ style, blocks, setBlocks, oldBlock, setIsEditState, ...otherProps }: EditMzBlockDetailsInputFormProps) {
  const [dayWorkStatus, setDayWorkStatus] = useState<DayWorkStatus>(oldBlock.dayWorkStatus);
  const [topDepthInMetresStr, setTopDepthInMetresStr] = useState<string>(oldBlock.topDepthInMetres.toFixed(3));
  const [penetrationDepthInMetresStr, setPenetrationDepthInMetresStr] = useState<string>(roundToDecimalPoint(oldBlock.penetrationDepthInMetres, 3).toString());
  const [recoveryLengthInMetresStr, setRecoveryLengthInMetresStr] = useState<string>(roundToDecimalPoint(oldBlock.recoveryLengthInMetres, 3).toString());
  const [topColourProperties, setTopColourProperties] = useState<ColourProperties>(oldBlock.topColourProperties);
  const [topSoilProperties, setTopSoilProperties] = useState<SoilProperties>(oldBlock.topSoilProperties);
  const [baseDitto, setBaseDitto] = useState<boolean>(oldBlock.baseDitto);
  const [bottomColourProperties, setBottomColourProperties] = useState<ColourProperties>(oldBlock.bottomColourProperties);
  const [bottomSoilProperties, setBottomSoilProperties] = useState<SoilProperties>(oldBlock.bottomSoilProperties);

  return (
    <GestureHandlerRootView style={styles.blockDetailsInputForm}>
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
      <Button
        title='Confirm'
        onPress={() => {
          const newBlock: Block = checkAndReturnUndisturbedSampleBlock({
            undisturbedSampleBlockTypeId: MZ_BLOCK_TYPE_ID,
            blocks: blocks,
            boreholeId: oldBlock.boreholeId, 
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
          setBlocks((blocks: Block[]) => {
            let sampleIndex: number = 1;
            return blocks.map((b: Block) => {
              if (b.blockTypeId !== MZ_BLOCK_TYPE_ID) {
                return b;
              }
              const updatedBlock: Block = (b === oldBlock) ? {...newBlock} : {...b};
              updatedBlock.id = b.id;
              updatedBlock.blockId = b.blockId;
              updatedBlock.sampleIndex = (updatedBlock.recoveryInPercentage === 0) ? -1 : sampleIndex++;
              return updatedBlock;
            });
          });
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