import React from "react";
import { Keyboard, Text, TextInput, TouchableOpacity, View } from "react-native";

import { DayWorkStatusInputQuestions } from '@/components/inputQuestions/DayWorkStatusInputQuestions';
import { DayWorkStatus, DayWorkStatusType } from "@/constants/DayWorkStatus";
import { stringToDecimalPoint } from "@/utils/numbers";
import { ColourProperties } from "@/interfaces/ColourProperties";
import { ColourPropertiesInputQuestions } from "./ColourPropertiesInputQuestions";
import { RockPropertiesInputQuestions } from "./RockPropertiesInputQuestions";
import { RockProperties } from "@/interfaces/RockProperties";

type CoringBlockInputQuestionsProps = {
  dayWorkStatus: DayWorkStatus; setDayWorkStatus: React.Dispatch<React.SetStateAction<DayWorkStatus>>;
  topDepthInMetresStr: string; setTopDepthInMetresStr: React.Dispatch<React.SetStateAction<string>>;
  coreRunInMetresStr: string; setCoreRunInMetresStr: React.Dispatch<React.SetStateAction<string>>;
  coreRecoveryInMetresStr: string; setCoreRecoveryInMetresStr: React.Dispatch<React.SetStateAction<string>>;
  rqdInMetresStr: string; setRqdInMetresStr: React.Dispatch<React.SetStateAction<string>>;
  colourProperties: ColourProperties; setColourProperties: React.Dispatch<React.SetStateAction<ColourProperties>>;
  rockProperties: RockProperties; setRockProperties: React.Dispatch<React.SetStateAction<RockProperties>>;
};

export function CoringBlockInputQuestions({
  dayWorkStatus, setDayWorkStatus,
  topDepthInMetresStr, setTopDepthInMetresStr,
  coreRunInMetresStr, setCoreRunInMetresStr,
  coreRecoveryInMetresStr, setCoreRecoveryInMetresStr,
  rqdInMetresStr, setRqdInMetresStr,
  colourProperties, setColourProperties,
  rockProperties, setRockProperties,
}: CoringBlockInputQuestionsProps) {

  const resetCoreRecovery = () => {
    setCoreRecoveryInMetresStr('');
  };
  const resetRqd = () => {
    setRqdInMetresStr('');
  };

  return (
    <>
    <DayWorkStatusInputQuestions 
      dayWorkStatus={dayWorkStatus} setDayWorkStatus={setDayWorkStatus}
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
      <Text>Core Run(m)<Text style={{ color: 'red' }}>*</Text>: </Text>
      <TextInput
        value={coreRunInMetresStr}
        onChangeText={(text: string) => {
          setCoreRunInMetresStr(text);
          resetCoreRecovery();
          resetRqd();
        }}
        style={{ borderWidth: 0.5, alignItems: 'center', padding: 10, flex: 1 }}
        keyboardType='numeric'
      />
    </View>
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <Text>Core Recovery(m)<Text style={{ color: 'red' }}>*</Text>: </Text>
      <TextInput
        value={coreRecoveryInMetresStr}
        onChangeText={(text: string) => {
          const coreRunInMetres: number = stringToDecimalPoint(coreRunInMetresStr, 3);
          if (isNaN(coreRunInMetres) || coreRunInMetres <= 0) {
            return;
          }
          setCoreRecoveryInMetresStr(text);
          const coreRecoveryInMetres: number = stringToDecimalPoint(text, 3);
          if (isNaN(coreRecoveryInMetres)) {
            return;
          }
          if (coreRecoveryInMetres > coreRunInMetres) {
            setCoreRecoveryInMetresStr(coreRunInMetres.toString());
          }
        }}
        style={{ borderWidth: 0.5, textAlign: 'center', padding: 10, width: 70 }}
        keyboardType='numeric'
      />
      <Text>
        {(() => {
          const coreRunInMetres: number = stringToDecimalPoint(coreRunInMetresStr, 3);
          return (coreRunInMetres > 0) ? `   /   ${coreRunInMetres}` : undefined;
        })()}
      </Text>
    </View>
    {
      stringToDecimalPoint(coreRecoveryInMetresStr, 3) > 0 && (
        <>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text>R.Q.D.(m)<Text style={{ color: 'red' }}>*</Text>: </Text>
          <TextInput
            value={rqdInMetresStr}
            onChangeText={(text: string) => {
              const coreRecoveryInMetres: number = stringToDecimalPoint(coreRecoveryInMetresStr, 3);
              if (isNaN(coreRecoveryInMetres) || coreRecoveryInMetres <= 0) {
                return;
              }
              setRqdInMetresStr(text);
              const rqdInMetres: number = stringToDecimalPoint(text, 3);
              if (isNaN(rqdInMetres)) {
                return;
              }
              if (rqdInMetres > coreRecoveryInMetres) {
                setRqdInMetresStr(coreRecoveryInMetres.toString());
              }
            }}
            style={{ borderWidth: 0.5, textAlign: 'center', padding: 10, width: 70 }}
            keyboardType='numeric'
          />
          <Text>
            {(() => {
              const coreRunInMetres: number = stringToDecimalPoint(coreRunInMetresStr, 3);
              return (coreRunInMetres > 0) ? `   /   ${coreRunInMetres}` : undefined;
            })()}
          </Text>
        </View>
        <ColourPropertiesInputQuestions questionPrefix="" colourProperties={colourProperties} setColourProperties={setColourProperties} />
        <RockPropertiesInputQuestions rockProperties={rockProperties} setRockProperties={setRockProperties} />
        </>
      )
    }
    </>
  );
}
