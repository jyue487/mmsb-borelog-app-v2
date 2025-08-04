import { DayWorkStatusInputQuestions } from "@/components/inputQuestions/DayWorkStatusInputQuestions";
import { DAY_CONTINUE_WORK_TYPE, DayWorkStatus } from "@/constants/DayWorkStatus";
import { Block } from "@/interfaces/Block";
import { checkAndReturnLugeonTestBlock } from "@/utils/checkFunctions/checkAndReturnLugeonTestBlock";
import { useState } from "react";
import { Button, Text, TextInput, View } from "react-native";

type Props = {
  boreholeId: number;
  blocks: Block[];
  setBlocks: React.Dispatch<React.SetStateAction<Block[]>>;
  setIsAddNewBlockButtonPressed: React.Dispatch<React.SetStateAction<boolean>>;
}

export function AddLugeonTestBlockDetailsInputForm({
  boreholeId,
  blocks,
  setBlocks,
  setIsAddNewBlockButtonPressed,
}: Props) {

  const [dayWorkStatus, setDayWorkStatus] = useState<DayWorkStatus>({
    dayWorkStatusType: DAY_CONTINUE_WORK_TYPE,
    date: new Date(),
    time: new Date(),
    waterLevelInMetres: null,
    casingDepthInMetres: null,
  });
  const [topDepthInMetresStr, setTopDepthInMetresStr] = useState<string>('');
  const [baseDepthInMetresStr, setBaseDepthInMetresStr] = useState<string>('');

  return (
    <>
      <DayWorkStatusInputQuestions dayWorkStatus={dayWorkStatus} setDayWorkStatus={setDayWorkStatus} />
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text>Top Depth(m)<Text style={{ color: 'red' }}>*</Text>: </Text>
        <TextInput
          value={topDepthInMetresStr}
          onChangeText={setTopDepthInMetresStr}
          style={{ borderWidth: 0.5, alignItems: 'center', padding: 10, flex: 1 }}
          keyboardType='numeric'
        />
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text>Base Depth(m)<Text style={{ color: 'red' }}>*</Text>: </Text>
        <TextInput
          value={baseDepthInMetresStr}
          onChangeText={setBaseDepthInMetresStr}
          style={{ borderWidth: 0.5, alignItems: 'center', padding: 10, flex: 1 }}
          keyboardType='numeric'
        />
      </View>
      <Button
        title='Confirm'
        onPress={() => {
          const newBlock: Block = checkAndReturnLugeonTestBlock({
            blocks: blocks,
            boreholeId: boreholeId,
            dayWorkStatus: dayWorkStatus,
            topDepthInMetresStr: topDepthInMetresStr,
            baseDepthInMetresStr: baseDepthInMetresStr,
          });
          setBlocks(blocks => [...blocks, newBlock]);
          setIsAddNewBlockButtonPressed(false);
        }}
      />
    </>
  );
}