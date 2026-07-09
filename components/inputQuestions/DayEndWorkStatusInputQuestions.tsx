import { FlatList, Keyboard, Text, TextInput, TouchableOpacity, View } from "react-native";

import { stringIsFloat, stringToDecimalPoint } from '@/utils/numbers';
import { useState } from 'react';
import { DayWorkStatusDateSelectorComponent } from '../datetime/DayWorkStatusDateSelectorComponent';
import { DayWorkStatusTimeSelectorComponent } from '../datetime/DayWorkStatusTimeSelectorComponent';
import { DayWorkStatusInputQuestionsProps } from "./DayWorkStatusInputQuestions";
import { waterLevelInMetresToString } from "@/utils/waterLevel";
import { WaterLevelInMetresInputQuestions } from "./WaterLevelInMetresInputQuestions";

export function DayEndWorkStatusInputQuestions({ dayWorkStatus, setDayWorkStatus }: DayWorkStatusInputQuestionsProps) {

  const [waterLevelInMetresStr, setWaterLevelInMetresStr] = useState<string>(waterLevelInMetresToString(dayWorkStatus.endWaterLevelInMetres));
  const [casingDepthInMetresStr, setCasingDepthInMetresStr] = useState<string>(dayWorkStatus.endCasingDepthInMetres?.toFixed(3) ?? '');

  const saveWaterLevelInMetresStr = (waterLevelInMetresStr: string) => {
    setWaterLevelInMetresStr(waterLevelInMetresStr);
    setDayWorkStatus({
      ...dayWorkStatus,
      endWaterLevelInMetres: (waterLevelInMetresStr.length === 0) ? null : (stringIsFloat(waterLevelInMetresStr)) ? stringToDecimalPoint(waterLevelInMetresStr, 3) : waterLevelInMetresStr,
    });
  };
  const saveCasingDepthInMetresStr = (casingDepthInMetresStr: string) => {
    setCasingDepthInMetresStr(casingDepthInMetresStr);
    setDayWorkStatus({
      ...dayWorkStatus,
      endCasingDepthInMetres: (casingDepthInMetresStr.length === 0) ? null : stringToDecimalPoint(casingDepthInMetresStr, 3),
    });
  };

  return (
    <>
      <View style={{ flexDirection: 'row' }}>
        <Text style={{ paddingVertical: 10 }}>Day End Work Date<Text style={{ color: 'red' }}>*</Text>: </Text>
        <DayWorkStatusDateSelectorComponent dayWorkStatus={dayWorkStatus} setDayWorkStatus={setDayWorkStatus} startOrEnd="end" />
      </View>
      <View style={{ flexDirection: 'row' }}>
        <Text style={{ paddingVertical: 10 }}>Day End Work Time<Text style={{ color: 'red' }}>*</Text>: </Text>
        <DayWorkStatusTimeSelectorComponent dayWorkStatus={dayWorkStatus} setDayWorkStatus={setDayWorkStatus} startOrEnd="end" />
      </View>
      <WaterLevelInMetresInputQuestions 
        title="Day End Water Level(m)"
        waterLevelInMetresStr={waterLevelInMetresStr}
        onChangeWaterLevelInMetresStr={saveWaterLevelInMetresStr}
      />
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text>Day End Casing Depth(m): </Text>
        <TextInput
          value={casingDepthInMetresStr}
          onChangeText={saveCasingDepthInMetresStr}
          style={{ borderWidth: 0.5, alignItems: 'center', padding: 10, flex: 1, backgroundColor: 'yellow' }}
          keyboardType='numeric'
        />
      </View>
    </>
  );
}
