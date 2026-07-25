import { DayWorkStatusInputQuestions } from "@/components/inputQuestions/DayWorkStatusInputQuestions";
import { DayWorkStatus } from "@/constants/DayWorkStatus";
import { BaseBlock, PRESSUREMETER_TEST_BLOCK_TYPE_ID } from "@/interfaces/Block";
import { createDefaultPressuremeterTestBlock, PressuremeterTestBlock } from "@/interfaces/PressuremeterTestBlock";
import { useEffect, useState } from "react";
import { Text, TextInput, View } from "react-native";
import { SpecificBlockDetailsInputFormProps } from "@/components/blockDetailsInputForms/BlockDetailsInputForm";
import { checkAndReturnPressuremeterTestBlock } from "@/utils/block/checkFunctions/checkAndReturnPressuremeterTestBlock";
import { depthInMetresToString } from "@/utils/depth";

export function PressuremeterTestBlockDetailsInputForm({ boreholeId, inputBlock, setCheckAndReturnBlock, ...otherProps }: SpecificBlockDetailsInputFormProps) {
  const block: BaseBlock & PressuremeterTestBlock = (inputBlock !== null && inputBlock.blockTypeId === PRESSUREMETER_TEST_BLOCK_TYPE_ID) ? inputBlock : createDefaultPressuremeterTestBlock();
  const [dayWorkStatus, setDayWorkStatus] = useState<DayWorkStatus>(block.dayWorkStatus);
  const [topDepthInMetresStr, setTopDepthInMetresStr] = useState<string>(depthInMetresToString(block.topDepthInMetres));
  const [baseDepthInMetresStr, setBaseDepthInMetresStr] = useState<string>(depthInMetresToString(block.baseDepthInMetres));

  useEffect(() => {
    setCheckAndReturnBlock(() => () => {
      return checkAndReturnPressuremeterTestBlock({
        boreholeId: boreholeId,
        dayWorkStatus: dayWorkStatus,
        topDepthInMetresStr: topDepthInMetresStr,
        baseDepthInMetresStr: baseDepthInMetresStr,
      });
    });
  }, [
    boreholeId,
    dayWorkStatus,
    topDepthInMetresStr,
    baseDepthInMetresStr,
  ]);

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
    </>
  );
}