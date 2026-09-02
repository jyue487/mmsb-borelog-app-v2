import { SpecificBlockDetailsInputFormProps } from "@/src/components/blockDetailsInputForms/BlockDetailsInputForm";
import { DayWorkStatusInputQuestions } from "@/src/components/inputQuestions/DayWorkStatusInputQuestions";
import {
  BaseBlock,
  CONSTANT_HEAD_PERMEABILITY_TEST_BLOCK_TYPE_ID,
  ConstantHeadPermeabilityTestBlock,
  createDefaultConstantHeadPermeabilityTestBlock,
  DayWorkStatus,
} from '@mmsb/core';
import { checkAndReturnConstantHeadPermeabilityTestBlock } from "@/src/utils/block/checkFunctions/checkAndReturnConstantHeadPermeabilityTestBlock";
import { depthInMetresToString } from "@/src/utils/depth";
import { useEffect, useState } from "react";
import { Text, TextInput, View } from "react-native";

export function ConstantHeadPermeabilityTestBlockDetailsInputForm({ boreholeId, inputBlock, setCheckAndReturnBlock, ...otherProps }: SpecificBlockDetailsInputFormProps) {
  const block: BaseBlock & ConstantHeadPermeabilityTestBlock = (inputBlock !== null && inputBlock.blockTypeId === CONSTANT_HEAD_PERMEABILITY_TEST_BLOCK_TYPE_ID) ? inputBlock : createDefaultConstantHeadPermeabilityTestBlock();
  const [dayWorkStatus, setDayWorkStatus] = useState<DayWorkStatus>(block.dayWorkStatus);
  const [topDepthInMetresStr, setTopDepthInMetresStr] = useState<string>(depthInMetresToString(block.topDepthInMetres));
  const [baseDepthInMetresStr, setBaseDepthInMetresStr] = useState<string>(depthInMetresToString(block.baseDepthInMetres));

  useEffect(() => {
    setCheckAndReturnBlock(() => () => {
      return checkAndReturnConstantHeadPermeabilityTestBlock({
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