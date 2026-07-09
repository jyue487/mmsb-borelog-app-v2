import { Text, TextInput, View } from "react-native";

import { DayWorkStatus } from "@/constants/DayWorkStatus";
import { styles } from '@/constants/styles';
import { stringIsFloat, stringToDecimalPoint } from '@/utils/numbers';
import { useState } from 'react';
import { DayWorkStatusDateSelectorComponent } from '../datetime/DayWorkStatusDateSelectorComponent';
import { DayWorkStatusTimeSelectorComponent } from '../datetime/DayWorkStatusTimeSelectorComponent';
import { DayWorkStatusInputQuestionsProps } from "./DayWorkStatusInputQuestions";
import { waterLevelInMetresToString } from "@/utils/waterLevel";
import { WaterLevelInMetresInputQuestions } from "./WaterLevelInMetresInputQuestions";

export function DayStartWorkStatusInputQuestions({ dayWorkStatus, setDayWorkStatus }: DayWorkStatusInputQuestionsProps) {

  const [waterLevelInMetresStr, setWaterLevelInMetresStr] = useState<string>(waterLevelInMetresToString(dayWorkStatus.startWaterLevelInMetres));
  const [casingDepthInMetresStr, setCasingDepthInMetresStr] = useState<string>(dayWorkStatus.startCasingDepthInMetres?.toFixed(3) ?? '');

  const saveWaterLevelInMetresStr = (waterLevelInMetresStr: string) => {
    setWaterLevelInMetresStr(waterLevelInMetresStr);
    setDayWorkStatus({
      ...dayWorkStatus,
      startWaterLevelInMetres: (waterLevelInMetresStr.length === 0) ? null : (stringIsFloat(waterLevelInMetresStr)) ? stringToDecimalPoint(waterLevelInMetresStr, 3) : waterLevelInMetresStr,
    });
  };
  const saveCasingDepthInMetresStr = (casingDepthInMetresStr: string) => {
    setCasingDepthInMetresStr(casingDepthInMetresStr);
    setDayWorkStatus({
      ...dayWorkStatus,
      startCasingDepthInMetres: (casingDepthInMetresStr.length === 0) ? null : stringToDecimalPoint(casingDepthInMetresStr, 3),
    });
  };

  return (
    <>
      <View style={{ flexDirection: 'row' }}>
        <Text style={{ paddingVertical: 10 }}>Day Start Work Date<Text style={{ color: 'red' }}>*</Text>: </Text>
        <DayWorkStatusDateSelectorComponent dayWorkStatus={dayWorkStatus} setDayWorkStatus={setDayWorkStatus} startOrEnd="start" />
      </View>
      <View style={{ flexDirection: 'row' }}>
        <Text style={{ paddingVertical: 10 }}>Day Start Work Time<Text style={{ color: 'red' }}>*</Text>: </Text>
        <DayWorkStatusTimeSelectorComponent dayWorkStatus={dayWorkStatus} setDayWorkStatus={setDayWorkStatus} startOrEnd="start" />
      </View>
      <WaterLevelInMetresInputQuestions 
        title="Day Start Water Level(m)"
        waterLevelInMetresStr={waterLevelInMetresStr}
        onChangeWaterLevelInMetresStr={saveWaterLevelInMetresStr}
      />
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text>Day Start Casing Depth(m): </Text>
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
