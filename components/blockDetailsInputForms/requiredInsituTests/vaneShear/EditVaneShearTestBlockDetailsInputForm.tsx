import { DayWorkStatusInputQuestions } from "@/components/inputQuestions/DayWorkStatusInputQuestions";
import { DAY_CONTINUE_WORK_TYPE, DayWorkStatus } from "@/constants/DayWorkStatus";
import { styles } from "@/constants/styles";
import { BaseBlock, Block, VANE_SHEAR_TEST_BLOCK_TYPE_ID } from "@/interfaces/Block";
import { VaneShearTestBlock } from "@/interfaces/VaneShearTestBlock";
import { checkAndReturnDayWorkStatus } from "@/utils/checkFunctions/checkAndReturnDayWorkStatus";
import { useState } from "react";
import { Button, Text, TextInput, View } from "react-native";

type Props = {
  blocks: Block[];
  setBlocks: React.Dispatch<React.SetStateAction<Block[]>>;
  oldBlock: BaseBlock & VaneShearTestBlock;
  setIsEditState: React.Dispatch<React.SetStateAction<boolean>>;
};

export function EditVaneShearTestBlockDetailsInputForm({
  blocks, 
  setBlocks, 
  oldBlock, 
  setIsEditState,
}: Props) {
  const [dayWorkStatus, setDayWorkStatus] = useState<DayWorkStatus>(oldBlock.dayWorkStatus);
  const [topDepthInMetresStr, setTopDepthInMetresStr] = useState<string>(oldBlock.topDepthInMetres.toFixed(3));
  const [baseDepthInMetresStr, setBaseDepthInMetresStr] = useState<string>(oldBlock.baseDepthInMetres.toFixed(3));

  return (
    <View style={styles.blockDetailsInputForm}>
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

          checkAndReturnDayWorkStatus(dayWorkStatus);
          
          if (isNaN(parseFloat(topDepthInMetresStr)) || parseFloat(topDepthInMetresStr) < 0) {
            alert('Error: Top Depth');
            return;
          }
          if (isNaN(parseFloat(baseDepthInMetresStr)) || parseFloat(baseDepthInMetresStr) < parseFloat(topDepthInMetresStr)) {
            alert('Error: Base Depth');
            return;
          }

          const topDepthInMetres: number = parseFloat(parseFloat(topDepthInMetresStr).toFixed(3));
          const baseDepthInMetres: number = parseFloat(parseFloat(baseDepthInMetresStr).toFixed(3));

          const newBlock: Block = {
            id: blocks.length + 1,
            blockId: blocks.length + 1,
            blockTypeId: VANE_SHEAR_TEST_BLOCK_TYPE_ID,
            boreholeId: oldBlock.boreholeId,
            vaneShearTestIndex: 1,
            dayWorkStatus: dayWorkStatus,
            topDepthInMetres: topDepthInMetres,
            baseDepthInMetres: baseDepthInMetres,
            description: 'Vane Shear Test',
          };
          setBlocks((blocks: Block[]) => blocks.map((b: Block) => (b === oldBlock) ? {...newBlock, id: b.id, blockId: b.blockId, vaneShearTestIndex: b.vaneShearTestIndex} : b));
          setIsEditState(false);
        }}
      />
    </View>
  );
}