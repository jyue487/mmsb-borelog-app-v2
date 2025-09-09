import { DayWorkStatusInputQuestions } from "@/components/inputQuestions/DayWorkStatusInputQuestions";
import { DAY_CONTINUE_WORK_TYPE, DayWorkStatus } from "@/constants/DayWorkStatus";
import { Block, FALLING_HEAD_PERMEABILITY_TEST_BLOCK_TYPE_ID } from "@/interfaces/Block";
import { addBlockAsync } from "@/utils/addBlockFunctions/addBlockAsync";
import { checkAndReturnFallingHeadPermeabilityTestBlock } from "@/utils/checkFunctions/checkAndReturnFallingHeadPermeabilityTestBlock";
import { useState } from "react";
import { Button, Text, TextInput, View } from "react-native";

type Props = {
  boreholeId: number;
  blocks: Block[];
  setBlocks: React.Dispatch<React.SetStateAction<Block[]>>;
  setIsAddNewBlockButtonPressed: React.Dispatch<React.SetStateAction<boolean>>;
};

export function AddFallingHeadPermeabilityTestBlockDetailsInputForm({
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
        <Text>Base Depth(m): </Text>
        <TextInput
          value={baseDepthInMetresStr}
          onChangeText={setBaseDepthInMetresStr}
          style={{ borderWidth: 0.5, alignItems: 'center', padding: 10, flex: 1 }}
          keyboardType='numeric'
        />
      </View>
      <Button
        title='Confirm'
        onPress={async () => {
          const newBlock: Block = checkAndReturnFallingHeadPermeabilityTestBlock({
            blocks: blocks,
            boreholeId: boreholeId,
            dayWorkStatus: dayWorkStatus,
            topDepthInMetresStr: topDepthInMetresStr,
            baseDepthInMetresStr: baseDepthInMetresStr,
          });
          setBlocks(await addBlockAsync(blocks, newBlock));
          setIsAddNewBlockButtonPressed(false);
        }}
      />
    </>
  );
}