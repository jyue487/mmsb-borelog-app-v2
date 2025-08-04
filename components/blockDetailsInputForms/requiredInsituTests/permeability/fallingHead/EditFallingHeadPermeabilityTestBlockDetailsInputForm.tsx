import { DayWorkStatusInputQuestions } from "@/components/inputQuestions/DayWorkStatusInputQuestions";
import { DayWorkStatus } from "@/constants/DayWorkStatus";
import { styles } from "@/constants/styles";
import { BaseBlock, Block, FALLING_HEAD_PERMEABILITY_TEST_BLOCK_TYPE_ID } from "@/interfaces/Block";
import { FallingHeadPermeabilityTestBlock } from "@/interfaces/FallingHeadPermeabilityTestBlock";
import { checkAndReturnFallingHeadPermeabilityTestBlock } from "@/utils/checkFunctions/checkAndReturnFallingHeadPermeabilityTestBlock";
import { useState } from "react";
import { Button, Text, TextInput, View } from "react-native";

type Props = {
  blocks: Block[];
  setBlocks: React.Dispatch<React.SetStateAction<Block[]>>;
  oldBlock: BaseBlock & FallingHeadPermeabilityTestBlock;
  setIsEditState: React.Dispatch<React.SetStateAction<boolean>>;
};

export function EditFallingHeadPermeabilityTestBlockDetailsInputForm({
  blocks, 
  setBlocks, 
  oldBlock, 
  setIsEditState,
}: Props) {
  const [dayWorkStatus, setDayWorkStatus] = useState<DayWorkStatus>(oldBlock.dayWorkStatus);
  const [topDepthInMetresStr, setTopDepthInMetresStr] = useState<string>(oldBlock.topDepthInMetres.toFixed(3));
  const [baseDepthInMetresStr, setBaseDepthInMetresStr] = useState<string>((oldBlock.topDepthInMetres === oldBlock.baseDepthInMetres) ? '' : oldBlock.baseDepthInMetres.toFixed(3));

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
        onPress={() => {
          const newBlock: Block = checkAndReturnFallingHeadPermeabilityTestBlock({
            blocks: blocks,
            boreholeId: oldBlock.boreholeId,
            dayWorkStatus: dayWorkStatus,
            topDepthInMetresStr: topDepthInMetresStr,
            baseDepthInMetresStr: baseDepthInMetresStr,
          });
          setBlocks((blocks: Block[]) => blocks.map((b: Block) => (b === oldBlock) ? {...newBlock, id: b.id, blockId: b.blockId, permeabilityTestIndex: b.permeabilityTestIndex} : b));
          setIsEditState(false);
        }}
      />
    </View>
  );
}