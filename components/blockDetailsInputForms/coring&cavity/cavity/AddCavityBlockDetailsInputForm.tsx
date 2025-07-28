import React, { useState } from "react";
import { Button, Keyboard, Text, TextInput, TouchableOpacity, View, type ViewProps } from "react-native";
import { FlatList } from "react-native-gesture-handler";

import { DayWorkStatusInputQuestions } from '@/components/inputQuestions/DayWorkStatusInputQuestions';
import { DAY_CONTINUE_WORK_TYPE, DayWorkStatus, DayWorkStatusType } from "@/constants/DayStatus";
import { styles } from "@/constants/styles";
import { Block, CAVITY_BLOCK_TYPE_ID } from "@/interfaces/Block";
import { checkAndReturnDayWorkStatus } from "@/utils/checkFunctions/checkAndReturnDayWorkStatus";

export type AddCavityBlockDetailsInputFormProps = ViewProps & {
  blocks: Block[];
  setBlocks: React.Dispatch<React.SetStateAction<Block[]>>;
  boreholeId: number;
  setIsAddNewBlockButtonPressed: React.Dispatch<React.SetStateAction<boolean>>;
};

export function AddCavityBlockDetailsInputForm({ style, boreholeId, blocks, setBlocks, setIsAddNewBlockButtonPressed, ...otherProps }: AddCavityBlockDetailsInputFormProps) {
  const [dayWorkStatusType, setDayWorkStatusType] = useState<DayWorkStatusType>(DAY_CONTINUE_WORK_TYPE);
  const [dayStartWorkDate, setDayStartWorkDate] = useState<Date>(new Date());
  const [dayStartWorkTime, setDayStartWorkTime] = useState<Date>(new Date());
  const [dayEndWorkDate, setDayEndWorkDate] = useState<Date>(new Date());
  const [dayEndWorkTime, setDayEndWorkTime] = useState<Date>(new Date());
  const [waterLevelInMetresStr, setWaterLevelInMetresStr] = useState<string>('');
  const [casingDepthInMetresStr, setCasingDepthInMetresStr] = useState<string>('');
  const [topDepthInMetresStr, setTopDepthInMetresStr] = useState<string>('');
  const [baseDepthInMetresStr, setBaseDepthInMetresStr] = useState<string>('');
  const [cavityDescription, setCavityDescription] = useState<string>('');
  const [isSelectCavityDescriptionPressed, setIsSelectCavityDescriptionPressed] = useState<boolean>(false);

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
    <View style={{ flexDirection: 'row' }}>
      <Text style={{ paddingVertical: 10 }}>Cavity Description<Text style={{ color: 'red' }}>*</Text>: </Text>
      <View style={{ flex: 1 }}>
        <TouchableOpacity 
          onPress={() => {
            Keyboard.dismiss();
            setIsSelectCavityDescriptionPressed(prev => !prev);
          }}
          style={{
            borderWidth: 0.5,
            alignItems: 'center',
            padding: 10,
            width: '100%',
          }}>
          <Text>{cavityDescription}</Text>
        </TouchableOpacity>
        {
          isSelectCavityDescriptionPressed && (
            <FlatList
              data={['Void Cavity', 'In-filled Cavity']}
              keyExtractor={item => item}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  onPress={() => {
                    Keyboard.dismiss();
                    setCavityDescription(item);
                    setIsSelectCavityDescriptionPressed(false);
                  }}
                  style={[styles.listItem]}>
                  <Text>{item}</Text>
                </TouchableOpacity>
              )}
              nestedScrollEnabled={true}
              style={{ maxHeight: 500 }}
            />
          )
        }
      </View>
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
        if (!cavityDescription) {
          alert('Error: Cavity Description');
          return;
        }

        const topDepthInMetres: number = parseFloat(parseFloat(topDepthInMetresStr).toFixed(3));
        const baseDepthInMetres: number = parseFloat(parseFloat(baseDepthInMetresStr).toFixed(3));

        const newBlock: Block = {
          id: blocks.length + 1,
          blockId: blocks.length + 1,
          blockTypeId: CAVITY_BLOCK_TYPE_ID,
          boreholeId: boreholeId, 
          dayWorkStatus: dayWorkStatus,
          topDepthInMetres: topDepthInMetres,
          baseDepthInMetres: baseDepthInMetres,
          cavityDescription: cavityDescription,
        };
        setBlocks(blocks => [...blocks, newBlock]);
        setIsAddNewBlockButtonPressed(false);
      }}
    />
    </>
  );
}
