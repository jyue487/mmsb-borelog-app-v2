import React, { useState } from "react";
import { Button, Text, TextInput, View, type ViewProps } from "react-native";

import { DayWorkStatusInputQuestions } from '@/components/inputQuestions/DayWorkStatusInputQuestions';
import { DayWorkStatus } from "@/constants/DayWorkStatus";
import { styles } from "@/constants/styles";
import { AsphaltBlock } from "@/interfaces/AsphaltBlock";
import { ASPHALT_BLOCK_TYPE_ID, BaseBlock, Block } from "@/interfaces/Block";
import { checkAndReturnDayWorkStatus } from "@/utils/checkFunctions/checkAndReturnDayWorkStatus";
import { editBlockAsync } from "@/utils/editBlockFunctions/editBlockAsync";

export type EditAsphaltBlockDetailsInputFormProps = ViewProps & {
  blocks: Block[];
  setBlocks: React.Dispatch<React.SetStateAction<Block[]>>;
  oldBlock: BaseBlock & AsphaltBlock;
  setIsEditState: React.Dispatch<React.SetStateAction<boolean>>;
};

export function EditAsphaltBlockDetailsInputForm({ style, blocks, setBlocks, oldBlock, setIsEditState, ...otherProps }: EditAsphaltBlockDetailsInputFormProps) {
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

          const topDepthInMetres: number = parseFloat(parseFloat(topDepthInMetresStr).toFixed(3));
          const baseDepthInMetres: number = parseFloat(parseFloat(baseDepthInMetresStr).toFixed(3));

          const newBlock: Block = {
            id: blocks.length + 1,
            blockTypeId: ASPHALT_BLOCK_TYPE_ID,
            boreholeId: oldBlock.boreholeId, 
            dayWorkStatus: dayWorkStatus,
            topDepthInMetres: topDepthInMetres,
            baseDepthInMetres: baseDepthInMetres,
            description: 'Asphalt, Tar, Bituminous Material',
            createdAt: oldBlock.createdAt,
            updatedAt: new Date(),
          };
          setBlocks(await editBlockAsync(blocks, oldBlock.id, newBlock));
          setIsEditState(false);
        }}
      />
      <Button 
        title='Cancel'
        onPress={() => setIsEditState(false)} 
      />
    </View>
  );
}
