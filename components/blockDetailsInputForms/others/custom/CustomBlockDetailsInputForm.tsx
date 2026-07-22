import React, { useEffect, useState } from "react";
import { Button, Text, TextInput, View, type ViewProps } from "react-native";

import { DayWorkStatusInputQuestions } from '@/components/inputQuestions/DayWorkStatusInputQuestions';
import { DayWorkStatus } from "@/constants/DayWorkStatus";
import { styles } from "@/constants/styles";
import { BaseBlock, Block, CUSTOM_BLOCK_TYPE_ID } from "@/interfaces/Block";
import { createDefaultCustomBlock, CustomBlock } from "@/interfaces/CustomBlock";
import { editBlockAsync } from "@/utils/block/editBlockFunctions/editBlockAsync";
import { checkAndReturnCustomBlock } from "@/utils/block/checkFunctions/checkAndReturnCustomBlock";
import { SpecificBlockDetailsInputFormProps } from "@/components/blockDetailsInputForms/BlockDetailsInputForm";
import { isNonNegative } from "@/utils/numbers";
import { depthInMetresToString } from "@/utils/depth";

export function CustomBlockDetailsInputForm({ boreholeId, inputBlock, setCheckAndReturnBlock, ...otherProps }: SpecificBlockDetailsInputFormProps) {
  const block: BaseBlock & CustomBlock = (inputBlock !== null && inputBlock.blockTypeId === CUSTOM_BLOCK_TYPE_ID) ? inputBlock : createDefaultCustomBlock();
  const [dayWorkStatus, setDayWorkStatus] = useState<DayWorkStatus>(block.dayWorkStatus);
  const [topDepthInMetresStr, setTopDepthInMetresStr] = useState<string>(depthInMetresToString(block.topDepthInMetres));
  const [baseDepthInMetresStr, setBaseDepthInMetresStr] = useState<string>(depthInMetresToString(block.baseDepthInMetres));
  const [customOperationType, setCustomOperationType] = useState<string>(block.description);

  useEffect(() => {
    setCheckAndReturnBlock(() => () => {
      return checkAndReturnCustomBlock({
        boreholeId: boreholeId,
        dayWorkStatus: dayWorkStatus,
        topDepthInMetresStr: topDepthInMetresStr,
        baseDepthInMetresStr: baseDepthInMetresStr,
        customOperationType: customOperationType,
      });
    });
  }, [
    boreholeId,
    dayWorkStatus,
    topDepthInMetresStr,
    baseDepthInMetresStr,
    customOperationType,
  ]);

  return (
    <>
      <DayWorkStatusInputQuestions dayWorkStatus={dayWorkStatus} setDayWorkStatus={setDayWorkStatus} />
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text>Top Depth(m): </Text>
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
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text>Custom Operation<Text style={{ color: 'red' }}>*</Text>: </Text>
        <TextInput
          value={customOperationType}
          onChangeText={setCustomOperationType}
          style={{ borderWidth: 0.5, padding: 10, flex: 1 }}
        />
      </View>
    </>
  );
}
