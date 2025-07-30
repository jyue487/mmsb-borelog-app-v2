import React, { useState } from "react";
import { Button, Text, TextInput, View, type ViewProps } from "react-native";

import { DayWorkStatusInputQuestions } from '@/components/inputQuestions/DayWorkStatusInputQuestions';
import { DAY_CONTINUE_WORK_TYPE, DayWorkStatus, DayWorkStatusType } from "@/constants/DayWorkStatus";
import { Block, CUSTOM_BLOCK_TYPE_ID } from "@/interfaces/Block";
import { checkAndReturnDayWorkStatus } from "@/utils/checkFunctions/checkAndReturnDayWorkStatus";
import { stringToDecimalPoint } from "@/utils/numbers";
import { checkAndReturnCustomBlock } from "@/utils/checkFunctions/checkAndReturnCustomBlock";

export type AddCustomBlockDetailsInputFormProps = ViewProps & {
  boreholeId: number;
  blocks: Block[];
  setBlocks: React.Dispatch<React.SetStateAction<Block[]>>;
  setIsAddNewBlockButtonPressed: React.Dispatch<React.SetStateAction<boolean>>;
};

export function AddCustomBlockDetailsInputForm({ style, boreholeId, blocks, setBlocks, setIsAddNewBlockButtonPressed, ...otherProps }: AddCustomBlockDetailsInputFormProps) {
  const [dayWorkStatus, setDayWorkStatus] = useState<DayWorkStatus>({
    dayWorkStatusType: DAY_CONTINUE_WORK_TYPE,
    date: new Date(),
    time: new Date(),
    waterLevelInMetres: null,
    casingDepthInMetres: null,
  });
  const [topDepthInMetresStr, setTopDepthInMetresStr] = useState<string>('');
  const [baseDepthInMetresStr, setBaseDepthInMetresStr] = useState<string>('');
  const [customOperationType, setCustomOperationType] = useState<string>('');

  return (
    <>
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
          boreholeId: boreholeId,
          dayWorkStatus: dayWorkStatus,
          topDepthInMetresStr: topDepthInMetresStr,
          baseDepthInMetresStr: baseDepthInMetresStr,
          customOperationType: customOperationType,
        });
        setBlocks(blocks => [...blocks, newBlock]);
        setIsAddNewBlockButtonPressed(false);
      }}
    />
    </>
  );     
}