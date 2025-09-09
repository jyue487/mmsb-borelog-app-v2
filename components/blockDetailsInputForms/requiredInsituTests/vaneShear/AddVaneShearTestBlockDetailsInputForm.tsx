import { DayWorkStatusInputQuestions } from "@/components/inputQuestions/DayWorkStatusInputQuestions";
import { DAY_CONTINUE_WORK_TYPE, DayWorkStatus } from "@/constants/DayWorkStatus";
import { Block, VANE_SHEAR_TEST_BLOCK_TYPE_ID } from "@/interfaces/Block";
import { addBlockAsync } from "@/utils/addBlockFunctions/addBlockAsync";
import { checkAndReturnDayWorkStatus } from "@/utils/checkFunctions/checkAndReturnDayWorkStatus";
import { useState } from "react";
import { Button, Text, TextInput, View } from "react-native";

type Props = {
  boreholeId: number;
  blocks: Block[];
  setBlocks: React.Dispatch<React.SetStateAction<Block[]>>;
  setIsAddNewBlockButtonPressed: React.Dispatch<React.SetStateAction<boolean>>;
};

export function AddVaneShearTestBlockDetailsInputForm({
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
        onPress={async () => {

          checkAndReturnDayWorkStatus(dayWorkStatus);
          
          if (isNaN(parseFloat(topDepthInMetresStr)) || parseFloat(topDepthInMetresStr) < 0) {
            alert('Error: Top Depth');
            return;
          }
          if (isNaN(parseFloat(baseDepthInMetresStr)) || parseFloat(baseDepthInMetresStr) < parseFloat(topDepthInMetresStr)) {
            alert('Error: Base Depth');
            return;
          }

          const vaneShearTestIndex: number = blocks.filter((block: Block) => block.blockTypeId === VANE_SHEAR_TEST_BLOCK_TYPE_ID).length + 1;
          const topDepthInMetres: number = parseFloat(parseFloat(topDepthInMetresStr).toFixed(3));
          const baseDepthInMetres: number = parseFloat(parseFloat(baseDepthInMetresStr).toFixed(3));

          const newBlock: Block = {
            id: blocks.length + 1,
            blockTypeId: VANE_SHEAR_TEST_BLOCK_TYPE_ID,
            vaneShearTestIndex: vaneShearTestIndex,
            boreholeId: boreholeId, 
            dayWorkStatus: dayWorkStatus,
            topDepthInMetres: topDepthInMetres,
            baseDepthInMetres: baseDepthInMetres,
            description: 'Vane Shear Test',
            createdAt: new Date(),
            updatedAt: null,
          };
          setBlocks(await addBlockAsync(blocks, newBlock));
          setIsAddNewBlockButtonPressed(false);
        }}
      />
    </>
  );
}