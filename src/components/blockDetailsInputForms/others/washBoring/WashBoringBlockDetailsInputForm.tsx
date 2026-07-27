import React, { useEffect, useState } from "react";
import { Text, TextInput, View } from "react-native";

import { SpecificBlockDetailsInputFormProps } from "@/src/components/blockDetailsInputForms/BlockDetailsInputForm";
import { DayWorkStatusInputQuestions } from '@/src/components/inputQuestions/DayWorkStatusInputQuestions';
import { DayWorkStatus } from "@/src/constants/DayWorkStatus";
import { BaseBlock, WASH_BORING_BLOCK_TYPE_ID } from "@/src/interfaces/Block";
import { WashBoringBlock, createDefaultWashBoringBlock } from "@/src/interfaces/WashBoringBlock";
import { checkAndReturnWashBoringBlock } from "@/src/utils/block/checkFunctions/checkAndReturnWashBoringBlock";
import { depthInMetresToString } from "@/src/utils/depth";

export function WashBoringBlockDetailsInputForm({ boreholeId, inputBlock, setCheckAndReturnBlock, ...otherProps }: SpecificBlockDetailsInputFormProps) {
  const block: BaseBlock & WashBoringBlock = (inputBlock !== null && inputBlock.blockTypeId === WASH_BORING_BLOCK_TYPE_ID) ? inputBlock : createDefaultWashBoringBlock();
  const [dayWorkStatus, setDayWorkStatus] = useState<DayWorkStatus>(block.dayWorkStatus);
  const [topDepthInMetresStr, setTopDepthInMetresStr] = useState<string>(depthInMetresToString(block.topDepthInMetres));
  const [baseDepthInMetresStr, setBaseDepthInMetresStr] = useState<string>(depthInMetresToString(block.baseDepthInMetres));

  useEffect(() => {
    setCheckAndReturnBlock(() => () => {
      return checkAndReturnWashBoringBlock({
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
