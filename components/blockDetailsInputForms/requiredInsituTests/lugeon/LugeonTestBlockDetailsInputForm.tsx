import { DayWorkStatusInputQuestions } from "@/components/inputQuestions/DayWorkStatusInputQuestions";
import { DayWorkStatus } from "@/constants/DayWorkStatus";
import { styles } from "@/constants/styles";
import { BaseBlock, Block, LUGEON_TEST_BLOCK_TYPE_ID } from "@/interfaces/Block";
import { createDefaultLugeonTestBlock, LugeonTestBlock } from "@/interfaces/LugeonTestBlock";
import { editBlockAsync } from "@/utils/block/editBlockFunctions/editBlockAsync";
import { checkAndReturnDayWorkStatus } from "@/utils/block/checkFunctions/checkAndReturnDayWorkStatus";
import { useState } from "react";
import { Button, Text, TextInput, View } from "react-native";
import { SpecificBlockDetailsInputFormProps } from "@/components/blockDetailsInputForms/BlockDetailsInputForm";
import { checkAndReturnLugeonTestBlock } from "@/utils/block/checkFunctions/checkAndReturnLugeonTestBlock";
import { isNonNegative } from "@/utils/numbers";
import { depthInMetresToString } from "@/utils/depth";

export function LugeonTestBlockDetailsInputForm({ boreholeId, inputBlock, onSubmitAsync, ...otherProps }: SpecificBlockDetailsInputFormProps) {
  const block: BaseBlock & LugeonTestBlock = (inputBlock !== null && inputBlock.blockTypeId === LUGEON_TEST_BLOCK_TYPE_ID) ? inputBlock : createDefaultLugeonTestBlock();
  const [dayWorkStatus, setDayWorkStatus] = useState<DayWorkStatus>(block.dayWorkStatus);
  const [topDepthInMetresStr, setTopDepthInMetresStr] = useState<string>(depthInMetresToString(block.topDepthInMetres));
  const [baseDepthInMetresStr, setBaseDepthInMetresStr] = useState<string>(depthInMetresToString(block.baseDepthInMetres));

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
        color={styles.confirmButton.color}
        onPress={async () => {
          try {
            const newBlock: Block = checkAndReturnLugeonTestBlock({
              boreholeId: boreholeId,
              dayWorkStatus: dayWorkStatus,
              topDepthInMetresStr: topDepthInMetresStr,
              baseDepthInMetresStr: baseDepthInMetresStr,
            });
            await onSubmitAsync(newBlock);
          } catch (err) {
            alert(err);
          }
        }}
      />
    </>
  );
}