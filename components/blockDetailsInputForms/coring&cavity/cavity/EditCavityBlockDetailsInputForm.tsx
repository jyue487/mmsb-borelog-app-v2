import React, { useState } from "react";
import { Button, View, type ViewProps } from "react-native";

import { CavityBlockInputQuestions } from "@/components/inputQuestions/CavityBlockInputQuestions";
import { DayWorkStatus } from "@/constants/DayWorkStatus";
import { styles } from "@/constants/styles";
import { BaseBlock, Block } from "@/interfaces/Block";
import { CavityBlock } from "@/interfaces/CavityBlock";
import { checkAndReturnCavityBlock } from "@/utils/checkFunctions/checkAndReturnCavityBlock";
import { roundToDecimalPoint } from "@/utils/numbers";
import { editBlockAsync } from "@/utils/editBlockFunctions/editBlockAsync";

export type EditCavityBlockDetailsInputFormProps = ViewProps & {
  blocks: Block[];
  setBlocks: React.Dispatch<React.SetStateAction<Block[]>>;
  oldBlock: BaseBlock & CavityBlock;
  setIsEditState: React.Dispatch<React.SetStateAction<boolean>>;
};

export function EditCavityBlockDetailsInputForm({ style, blocks, setBlocks, oldBlock, setIsEditState, ...otherProps }: EditCavityBlockDetailsInputFormProps) {
  const [dayWorkStatus, setDayWorkStatus] = useState<DayWorkStatus>(oldBlock.dayWorkStatus);
  const [topDepthInMetresStr, setTopDepthInMetresStr] = useState<string>(roundToDecimalPoint(oldBlock.topDepthInMetres, 3).toString());
  const [baseDepthInMetresStr, setBaseDepthInMetresStr] = useState<string>(roundToDecimalPoint(oldBlock.baseDepthInMetres, 3).toString());
  const [description, setDescription] = useState<string>(oldBlock.description); 

  return (
    <View style={styles.blockDetailsInputForm}>
      <CavityBlockInputQuestions 
        dayWorkStatus={dayWorkStatus} setDayWorkStatus={setDayWorkStatus}
        topDepthInMetresStr={topDepthInMetresStr} setTopDepthInMetresStr={setTopDepthInMetresStr}
        baseDepthInMetresStr={baseDepthInMetresStr} setBaseDepthInMetresStr={setBaseDepthInMetresStr}
        description={description} setDescription={setDescription}
      />
      <Button
        title='Confirm'
        onPress={async () => {
          const newBlock: Block = checkAndReturnCavityBlock({
            blocks: blocks,
            boreholeId: oldBlock.boreholeId,
            dayWorkStatus: dayWorkStatus,
            topDepthInMetresStr: topDepthInMetresStr,
            baseDepthInMetresStr: baseDepthInMetresStr,
            description: description,
          });
          setBlocks(await editBlockAsync(blocks, oldBlock.id, newBlock));
          setIsEditState(false);
        }}
      />
      <Button 
        title='Cancel'
        onPress={() => setIsEditState(false)} 
      />
    </View>
  );
}
