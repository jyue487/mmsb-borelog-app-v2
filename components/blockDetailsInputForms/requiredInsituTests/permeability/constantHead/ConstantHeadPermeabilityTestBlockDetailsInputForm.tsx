import { DayWorkStatusInputQuestions } from "@/components/inputQuestions/DayWorkStatusInputQuestions";
import { DayWorkStatus } from "@/constants/DayWorkStatus";
import { styles } from "@/constants/styles";
import { BaseBlock, Block, CONSTANT_HEAD_PERMEABILITY_TEST_BLOCK_TYPE_ID } from "@/interfaces/Block";
import { createDefaultConstantHeadPermeabilityTestBlock, ConstantHeadPermeabilityTestBlock } from "@/interfaces/ConstantHeadPermeabilityTestBlock";
import { editBlockAsync } from "@/utils/block/editBlockFunctions/editBlockAsync";
import { checkAndReturnDayWorkStatus } from "@/utils/block/checkFunctions/checkAndReturnDayWorkStatus";
import { useEffect, useState } from "react";
import { Button, Text, TextInput, View } from "react-native";
import { SpecificBlockDetailsInputFormProps } from "@/components/blockDetailsInputForms/BlockDetailsInputForm";
import { checkAndReturnConstantHeadPermeabilityTestBlock } from "@/utils/block/checkFunctions/checkAndReturnConstantHeadPermeabilityTestBlock";
import { isNonNegative } from "@/utils/numbers";
import { depthInMetresToString } from "@/utils/depth";

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