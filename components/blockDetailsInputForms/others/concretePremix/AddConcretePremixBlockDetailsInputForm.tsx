import React, { useState } from "react";
import { Button, Text, TextInput, View, type ViewProps } from "react-native";

import { DayWorkStatusInputQuestions } from '@/components/inputQuestions/DayWorkStatusInputQuestions';
import { DAY_CONTINUE_WORK_TYPE, DayWorkStatus, DayWorkStatusType } from "@/constants/DayStatus";
import { Block, CONCRETE_PREMIX_BLOCK_TYPE_ID } from "@/interfaces/Block";
import { checkAndReturnDayWorkStatus } from "@/utils/checkFunctions/checkAndReturnDayWorkStatus";

export type AddConcretePremixBlockDetailsInputFormProps = ViewProps & {
  boreholeId: number;
  blocks: Block[];
  setBlocks: React.Dispatch<React.SetStateAction<Block[]>>;
  setIsAddNewBlockButtonPressed: React.Dispatch<React.SetStateAction<boolean>>;
};

export function AddConcretePremixBlockDetailsInputForm({ style, boreholeId, blocks, setBlocks, setIsAddNewBlockButtonPressed, ...otherProps }: AddConcretePremixBlockDetailsInputFormProps) {
  const [dayWorkStatusType, setDayWorkStatusType] = useState<DayWorkStatusType>(DAY_CONTINUE_WORK_TYPE);
  const [dayStartWorkDate, setDayStartWorkDate] = useState<Date>(new Date());
  const [dayStartWorkTime, setDayStartWorkTime] = useState<Date>(new Date());
  const [dayEndWorkDate, setDayEndWorkDate] = useState<Date>(new Date());
  const [dayEndWorkTime, setDayEndWorkTime] = useState<Date>(new Date());
  const [waterLevelInMetresStr, setWaterLevelInMetresStr] = useState<string>('');
  const [casingDepthInMetresStr, setCasingDepthInMetresStr] = useState<string>('');
  const [topDepthInMetresStr, setTopDepthInMetresStr] = useState<string>('');
  const [baseDepthInMetresStr, setBaseDepthInMetresStr] = useState<string>('');

  return (
    <>
      <DayWorkStatusInputQuestions 
        dayWorkStatusType={dayWorkStatusType} setDayWorkStatusType={setDayWorkStatusType}
        dayStartWorkDate={dayStartWorkDate} setDayStartWorkDate={setDayStartWorkDate}
        dayStartWorkTime={dayStartWorkTime} setDayStartWorkTime={setDayStartWorkTime}
        dayEndWorkDate={dayEndWorkDate} setDayEndWorkDate={setDayEndWorkDate}
        dayEndWorkTime={dayEndWorkTime} setDayEndWorkTime={setDayEndWorkTime}
        waterLevelInMetresStr={waterLevelInMetresStr} setWaterLevelInMetresStr={setWaterLevelInMetresStr}
        casingDepthInMetresStr={casingDepthInMetresStr} setCasingDepthInMetresStr={setCasingDepthInMetresStr}
      />
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
          const dayWorkStatus: DayWorkStatus | undefined = checkAndReturnDayWorkStatus({
            dayWorkStatusType: dayWorkStatusType,
            dayStartWorkDate: dayStartWorkDate,
            dayStartWorkTime: dayStartWorkTime,
            dayEndWorkDate: dayEndWorkDate,
            dayEndWorkTime: dayEndWorkTime,
            waterLevelInMetresStr: waterLevelInMetresStr,
            casingDepthInMetresStr: casingDepthInMetresStr,
          });
          if (!dayWorkStatus) {
            return;
          }
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

          const newConcretePremixBlock: Block = {
            id: blocks.length + 1,
            blockTypeId: CONCRETE_PREMIX_BLOCK_TYPE_ID,
            boreholeId: boreholeId, 
            blockId: 1,
            dayWorkStatus: dayWorkStatus,
            topDepthInMetres: topDepthInMetres,
            baseDepthInMetres: baseDepthInMetres,
            description: 'Concrete Premix',
          };
          setBlocks(blocks => [...blocks, newConcretePremixBlock]);
          setIsAddNewBlockButtonPressed(false);
        }}
      />
    </>
  );
}
