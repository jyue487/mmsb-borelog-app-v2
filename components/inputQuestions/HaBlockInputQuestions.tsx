import React, { useState } from "react";
import { Keyboard, Text, TextInput, TouchableOpacity, View } from "react-native";
import { FlatList } from "react-native-gesture-handler";

import { ColourPropertiesInputQuestions } from "@/components/inputQuestions/ColourPropertiesInputQuestions";
import { DayWorkStatusInputQuestions } from '@/components/inputQuestions/DayWorkStatusInputQuestions';
import { SoilPropertiesInputQuestions } from "@/components/inputQuestions/SoilPropertiesInputQuestions";
import { DayWorkStatus } from "@/constants/DayWorkStatus";
import { styles } from "@/constants/styles";
import { ColourProperties } from "@/interfaces/ColourProperties";
import { SoilProperties } from "@/interfaces/SoilProperties";

type Params = {
  dayWorkStatus: DayWorkStatus; setDayWorkStatus: React.Dispatch<React.SetStateAction<DayWorkStatus>>;
  topDepthInMetresStr: string; setTopDepthInMetresStr: React.Dispatch<React.SetStateAction<string>>;
  baseDepthInMetresStr: string; setBaseDepthInMetresStr: React.Dispatch<React.SetStateAction<string>>;
  requireSample: boolean; setRequireSample: React.Dispatch<React.SetStateAction<boolean>>;
  colourProperties: ColourProperties; setColourProperties: React.Dispatch<React.SetStateAction<ColourProperties>>;
  soilProperties: SoilProperties; setSoilProperties: React.Dispatch<React.SetStateAction<SoilProperties>>;
};

export function HaBlockInputQuestions({
  dayWorkStatus, setDayWorkStatus,
  topDepthInMetresStr, setTopDepthInMetresStr,
  baseDepthInMetresStr, setBaseDepthInMetresStr,
  requireSample, setRequireSample,
  colourProperties, setColourProperties,
  soilProperties, setSoilProperties,
}: Params) {

  const [isSelectRequireSamplePressed, setIsSelectRequireSamplePressed] = useState<boolean>(false);

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
    <View style={{ flexDirection: 'row' }}>
      <Text style={{ paddingVertical: 10 }}>Require Sample?<Text style={{ color: 'red' }}>*</Text>: </Text>
      <View style={{ flex: 1 }}>
        <TouchableOpacity 
          onPress={() => {
            Keyboard.dismiss();
            setIsSelectRequireSamplePressed(prev => !prev);
          }}
          style={{
            borderWidth: 0.5,
            alignItems: 'center',
            padding: 10,
            width: '100%',
          }}>
          <Text>{requireSample ? 'YES' : 'NO'}</Text>
        </TouchableOpacity>
        {
          isSelectRequireSamplePressed && (
            <FlatList
              data={['YES', 'NO']}
              keyExtractor={item => item}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  onPress={() => {
                    Keyboard.dismiss();
                    setRequireSample((item === 'YES') ? true : false);
                    setIsSelectRequireSamplePressed(false);
                  }}
                  style={[styles.listItem]}>
                  <Text>{item}</Text>
                </TouchableOpacity>
              )}
            />
          )
        }
      </View>
    </View>
    {
      requireSample && (
        <>
        <ColourPropertiesInputQuestions questionPrefix={''} colourProperties={colourProperties} setColourProperties={setColourProperties} />
        <SoilPropertiesInputQuestions questionPrefix={''} soilProperties={soilProperties} setSoilProperties={setSoilProperties} />
        </>
      )
    }
    </>
  );
}