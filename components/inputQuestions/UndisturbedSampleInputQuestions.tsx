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
import { stringToDecimalPoint } from "@/utils/numbers";

type Params = {
  dayWorkStatus: DayWorkStatus; setDayWorkStatus: React.Dispatch<React.SetStateAction<DayWorkStatus>>;
  topDepthInMetresStr: string; setTopDepthInMetresStr: React.Dispatch<React.SetStateAction<string>>;
  penetrationDepthInMetresStr: string; setPenetrationDepthInMetresStr: React.Dispatch<React.SetStateAction<string>>;
  recoveryLengthInMetresStr: string; setRecoveryLengthInMetresStr: React.Dispatch<React.SetStateAction<string>>;
  topColourProperties: ColourProperties; setTopColourProperties: React.Dispatch<React.SetStateAction<ColourProperties>>;
  topSoilProperties: SoilProperties; setTopSoilProperties: React.Dispatch<React.SetStateAction<SoilProperties>>;
  baseDitto: boolean; setBaseDitto: React.Dispatch<React.SetStateAction<boolean>>;
  bottomColourProperties: ColourProperties; setBottomColourProperties: React.Dispatch<React.SetStateAction<ColourProperties>>;
  bottomSoilProperties: SoilProperties; setBottomSoilProperties: React.Dispatch<React.SetStateAction<SoilProperties>>;
};

export function UndisturbedSampleInputQuestions({
  dayWorkStatus, setDayWorkStatus,
  topDepthInMetresStr, setTopDepthInMetresStr,
  penetrationDepthInMetresStr, setPenetrationDepthInMetresStr,
  recoveryLengthInMetresStr, setRecoveryLengthInMetresStr,
  topColourProperties, setTopColourProperties,
  topSoilProperties, setTopSoilProperties,
  baseDitto, setBaseDitto,
  bottomColourProperties, setBottomColourProperties,
  bottomSoilProperties, setBottomSoilProperties,
}: Params) {

  const [isSelectBaseDittoPressed, setIsSelectBaseDittoPressed] = useState<boolean>(false);

  const resetRecoveryLength = () => {
		setRecoveryLengthInMetresStr('');
	};

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
      <Text>Penetration Depth(m)<Text style={{ color: 'red' }}>*</Text>: </Text>
      <TextInput
        value={penetrationDepthInMetresStr}
        onChangeText={(text: string) => {
          resetRecoveryLength();
          setPenetrationDepthInMetresStr(text);
          const penetrationDepthInMetres: number = parseFloat(text);
          if (isNaN(penetrationDepthInMetres)) {
            return;
          }
          if (penetrationDepthInMetres > 1) {
            setPenetrationDepthInMetresStr('1');
          }
        }}
        style={{ borderWidth: 0.5, alignItems: 'center', padding: 10, flex: 1 }}
        keyboardType='numeric'
      />
    </View>
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <Text>Recovery(m)<Text style={{ color: 'red' }}>*</Text>: </Text>
      <TextInput
        value={recoveryLengthInMetresStr}
        onChangeText={(text: string) => {
          const penetrationDepthInMetres: number = stringToDecimalPoint(penetrationDepthInMetresStr, 3);
          if (isNaN(penetrationDepthInMetres)) {
            return;
          }
          setRecoveryLengthInMetresStr(text);
          const recoveryLengthInMetres: number = stringToDecimalPoint(text, 3);
          if (isNaN(recoveryLengthInMetres)) {
            return;
          }
          if (recoveryLengthInMetres > penetrationDepthInMetres) {
            setRecoveryLengthInMetresStr(penetrationDepthInMetres.toString());
          }
        }}
        style={{ borderWidth: 0.5, textAlign: 'center', padding: 10, width: 70 }}
        keyboardType='numeric'
      />
      <Text>
        {(() => {
          const penetrationDepthInMetres: number = stringToDecimalPoint(penetrationDepthInMetresStr, 3);
          return (penetrationDepthInMetres > 0) ? `   /   ${penetrationDepthInMetres}` : undefined;
        })()}
      </Text>
    </View>
    {
      (!isNaN(parseFloat(recoveryLengthInMetresStr)) && stringToDecimalPoint(recoveryLengthInMetresStr, 3) > 0) && (
        <>
        <ColourPropertiesInputQuestions questionPrefix="Top " colourProperties={topColourProperties} setColourProperties={setTopColourProperties} />
        <SoilPropertiesInputQuestions questionPrefix="Top " soilProperties={topSoilProperties} setSoilProperties={setTopSoilProperties} />
        <View style={{ flexDirection: 'row' }}>
          <Text style={{ paddingVertical: 10 }}>Bottom Ditto?<Text style={{ color: 'red' }}>*</Text>: </Text>
          <View style={{ flex: 1 }}>
            <TouchableOpacity 
              onPress={() => {
                Keyboard.dismiss();
                setIsSelectBaseDittoPressed(prev => !prev);
              }}
              style={{
                borderWidth: 0.5,
                alignItems: 'center',
                padding: 10,
                width: '100%',
              }}>
              <Text>{baseDitto ? 'YES' : 'NO'}</Text>
            </TouchableOpacity>
            {
              isSelectBaseDittoPressed && (
                <FlatList
                  data={['YES', 'NO']}
                  keyExtractor={item => item}
                  renderItem={({ item }) => (
                    <TouchableOpacity 
                      onPress={() => {
                        Keyboard.dismiss();
                        setBaseDitto((item === 'YES') ? true : false);
                        setIsSelectBaseDittoPressed(false);
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
          !baseDitto && (
            <>
            <ColourPropertiesInputQuestions questionPrefix="Bottom " colourProperties={bottomColourProperties} setColourProperties={setBottomColourProperties} />
            <SoilPropertiesInputQuestions questionPrefix="Bottom " soilProperties={bottomSoilProperties} setSoilProperties={setBottomSoilProperties} />
            </>
          )
        }
        </>
      )
    }
    </>
  );
}