import React, { useState } from "react";
import { Button, Keyboard, Text, TextInput, TouchableOpacity, View, type ViewProps } from "react-native";
import { FlatList } from "react-native-gesture-handler";

import { DayWorkStatusInputQuestions } from '@/components/inputQuestions/DayWorkStatusInputQuestions';
import { DAY_CONTINUE_WORK_TYPE, DayWorkStatus, DayWorkStatusType } from "@/constants/DayWorkStatus";
import { styles } from "@/constants/styles";
import { Block, CAVITY_BLOCK_TYPE_ID } from "@/interfaces/Block";
import { checkAndReturnDayWorkStatus } from "@/utils/checkFunctions/checkAndReturnDayWorkStatus";

type Props = {
  dayWorkStatus: DayWorkStatus; setDayWorkStatus: React.Dispatch<React.SetStateAction<DayWorkStatus>>;
  topDepthInMetresStr: string; setTopDepthInMetresStr: React.Dispatch<React.SetStateAction<string>>;
  baseDepthInMetresStr: string; setBaseDepthInMetresStr: React.Dispatch<React.SetStateAction<string>>;
  description: string; setDescription: React.Dispatch<React.SetStateAction<string>>;
}

export function CavityBlockInputQuestions({
  dayWorkStatus, setDayWorkStatus,
  topDepthInMetresStr, setTopDepthInMetresStr,
  baseDepthInMetresStr, setBaseDepthInMetresStr,
  description, setDescription
}: Props) {

  const [isSelectCavityDescriptionPressed, setIsSelectCavityDescriptionPressed] = useState<boolean>(false);

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
          <Text>{description}</Text>
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
                    setDescription(item);
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
    </>
  );
}