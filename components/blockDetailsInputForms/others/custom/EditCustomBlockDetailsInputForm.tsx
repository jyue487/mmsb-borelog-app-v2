import React, { useState } from "react";
import { Button, Text, TextInput, View, type ViewProps } from "react-native";

import { DayWorkStatusInputQuestions } from '@/components/inputQuestions/DayWorkStatusInputQuestions';
import { DayWorkStatus } from "@/constants/DayWorkStatus";
import { styles } from "@/constants/styles";
import { BaseBlock, Block } from "@/interfaces/Block";
import { CustomBlock } from "@/interfaces/CustomBlock";
import { checkAndReturnCustomBlock } from "@/utils/checkFunctions/checkAndReturnCustomBlock";

export type EditCustomBlockDetailsInputFormProps = ViewProps & {
  blocks: Block[];
  setBlocks: React.Dispatch<React.SetStateAction<Block[]>>;
  oldBlock: BaseBlock & CustomBlock;
  setIsEditState: React.Dispatch<React.SetStateAction<boolean>>;
};

export function EditCustomBlockDetailsInputForm({ style, blocks, setBlocks, oldBlock, setIsEditState, ...otherProps }: EditCustomBlockDetailsInputFormProps) {
  const [dayWorkStatus, setDayWorkStatus] = useState<DayWorkStatus>(oldBlock.dayWorkStatus);
  const [topDepthInMetresStr, setTopDepthInMetresStr] = useState<string>((oldBlock.topDepthInMetres === -1) ? '' : oldBlock.topDepthInMetres.toFixed(3));
  const [baseDepthInMetresStr, setBaseDepthInMetresStr] = useState<string>((oldBlock.baseDepthInMetres === -1) ? '' : oldBlock.baseDepthInMetres.toFixed(3));
  const [customOperationType, setCustomOperationType] = useState<string>(oldBlock.description);

  return (
    <View style={styles.blockDetailsInputForm}>
      <DayWorkStatusInputQuestions dayWorkStatus={dayWorkStatus} setDayWorkStatus={setDayWorkStatus} />
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text>Top Depth(m): </Text>
        <TextInput
          value={topDepthInMetresStr}
          onChangeText={setTopDepthInMetresStr}
          style={{ borderWidth: 0.5, alignItems: 'center', padding: 10, flex: 1 }}
          keyboardType='numeric'
        />
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text>Base Depth(m): </Text>
        <TextInput
          value={baseDepthInMetresStr}
          onChangeText={setBaseDepthInMetresStr}
          style={{ borderWidth: 0.5, alignItems: 'center', padding: 10, flex: 1 }}
          keyboardType='numeric'
        />
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text>Custom Operation<Text style={{ color: 'red' }}>*</Text>: </Text>
        <TextInput
          value={customOperationType}
          onChangeText={setCustomOperationType}
          style={{ borderWidth: 0.5, padding: 10, flex: 1 }}
        />
      </View>
      <Button
        title='Confirm'
        onPress={() => {
          const newBlock: Block = checkAndReturnCustomBlock({
            blocks: blocks,
            boreholeId: oldBlock.boreholeId,
            dayWorkStatus: dayWorkStatus,
            topDepthInMetresStr: topDepthInMetresStr,
            baseDepthInMetresStr: baseDepthInMetresStr,
            customOperationType: customOperationType,
          });
          setBlocks((blocks: Block[]) => blocks.map((b: Block) => (b === oldBlock) ? {...newBlock, id: b.id, blockId: b.blockId} : b));
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
