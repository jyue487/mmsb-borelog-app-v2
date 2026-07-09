import { END_OF_BOREHOLE_OTHER_INSTALLATIONS_CUSTOM, END_OF_BOREHOLE_OTHER_INSTALLATIONS_LIST, END_OF_BOREHOLE_OTHER_INSTALLATIONS_NONE, END_OF_BOREHOLE_OTHER_INSTALLATIONS_STANDPIPE_PIEZOMETER, END_OF_BOREHOLE_OTHER_INSTALLATIONS_WATER_STANDPIPE, endOfBoreholeOtherInstallationsType } from "@/constants/endOfBorehole";
import { styles } from "@/constants/styles";
import { Block } from "@/interfaces/Block";
import { stringToDecimalPoint } from "@/utils/numbers";
import { useState } from "react";
import { Keyboard, Text, TextInput, TouchableOpacity, View } from "react-native";
import { DateTimeSelectorComponent } from "../datetime/DateTimeSelectorComponent";
import { WaterLevelInMetresInputQuestions } from "./WaterLevelInMetresInputQuestions";

type Props = {
  blocks: Block[];
  otherInstallations: endOfBoreholeOtherInstallationsType; setOtherInstallations: React.Dispatch<React.SetStateAction<endOfBoreholeOtherInstallationsType>>;
  customInstallations: string; setCustomInstallations: React.Dispatch<React.SetStateAction<string>>;
  installationDepthInMetresStr: string; setInstallationDepthInMetresStr: React.Dispatch<React.SetStateAction<string>>;
  installationDate: Date | null; setInstallationDate: React.Dispatch<React.SetStateAction<Date | null>>;
  installationTime: Date | null; setInstallationTime: React.Dispatch<React.SetStateAction<Date | null>>;
  waterLevelInMetresStr: string; setWaterLevelInMetresStr: React.Dispatch<React.SetStateAction<string>>;
  remarks: string; setRemarks: React.Dispatch<React.SetStateAction<string>>;
}

export function EndOfBoreholeInputQuestions({
  blocks,
  otherInstallations, setOtherInstallations,
  customInstallations, setCustomInstallations,
  installationDepthInMetresStr, setInstallationDepthInMetresStr,
  installationDate, setInstallationDate,
  installationTime, setInstallationTime,
  waterLevelInMetresStr, setWaterLevelInMetresStr,
  remarks, setRemarks,
}: Props) {

  const [isSelectOtherInstallationsPressed, setIsSelectOtherInstallationsPressed] = useState<boolean>(false);

  return (
    <>
      <View style={{ flexDirection: 'row' }}>
        <Text style={{ paddingVertical: 10 }}>Other Installations: </Text>
        <View style={{ flex: 1 }}>
          <TouchableOpacity
            onPress={() => {
              Keyboard.dismiss();
              setIsSelectOtherInstallationsPressed(prev => !prev);
            }}
            style={{
              borderWidth: 0.5,
              alignItems: 'center',
              padding: 10,
              width: '100%',
            }}>
            <Text>{otherInstallations}</Text>
          </TouchableOpacity>
          {
            isSelectOtherInstallationsPressed && (
              END_OF_BOREHOLE_OTHER_INSTALLATIONS_LIST.map((item) => (
                <TouchableOpacity
                  key={item}
                  onPress={() => {
                    Keyboard.dismiss();
                    setOtherInstallations(item);
                    setInstallationDate((item === END_OF_BOREHOLE_OTHER_INSTALLATIONS_NONE) ? null : (installationDate === null) ? new Date() : installationDate);
                    setInstallationTime((item === END_OF_BOREHOLE_OTHER_INSTALLATIONS_NONE) ? null : (installationTime === null) ? new Date() : installationTime);
                    setWaterLevelInMetresStr((item === END_OF_BOREHOLE_OTHER_INSTALLATIONS_STANDPIPE_PIEZOMETER || item === END_OF_BOREHOLE_OTHER_INSTALLATIONS_WATER_STANDPIPE) ? waterLevelInMetresStr : '');
                    setIsSelectOtherInstallationsPressed(false);
                  }}
                  style={[styles.listItem]}>
                  <Text>{item}</Text>
                </TouchableOpacity>
              ))
            )
          }
          {
            otherInstallations === END_OF_BOREHOLE_OTHER_INSTALLATIONS_CUSTOM && (
              <TextInput
                value={customInstallations}
                onChangeText={setCustomInstallations}
                style={{ borderWidth: 0.5, padding: 10, textAlign: 'center' }}
              />
            )
          }
        </View>
      </View>
      {
        otherInstallations !== END_OF_BOREHOLE_OTHER_INSTALLATIONS_NONE && (
          <>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text>Installation Depth(m)<Text style={{ color: 'red' }}>*</Text>: </Text>
              <TextInput
                value={installationDepthInMetresStr}
                onChangeText={(text: string) => {
                  if (blocks.length === 0) {
                    return;
                  }
                  const endOfBoreholeDepthInMetres: number = blocks[blocks.length - 1].baseDepthInMetres;
                  setInstallationDepthInMetresStr(text);
                  const installationDepthInMetres: number = stringToDecimalPoint(text, 3);
                  if (isNaN(installationDepthInMetres)) {
                    return;
                  }
                  if (installationDepthInMetres > endOfBoreholeDepthInMetres) {
                    setInstallationDepthInMetresStr(endOfBoreholeDepthInMetres.toString());
                  }
                }}
                style={{ borderWidth: 0.5, alignItems: 'center', padding: 10, width: 70, flex: 1 }}
                keyboardType='numeric'
              />
            </View>
            <View style={{ flexDirection: 'row' }}>
              <Text style={{ paddingVertical: 10 }}>Installation Date<Text style={{ color: 'red' }}>*</Text>: </Text>
              <DateTimeSelectorComponent dateTime={installationDate ?? new Date()} onDateTimeChange={(newDateTime: Date) => setInstallationDate(newDateTime)} dateOrTime="date" />
            </View>
            <View style={{ flexDirection: 'row' }}>
              <Text style={{ paddingVertical: 10 }}>Installation Time<Text style={{ color: 'red' }}>*</Text>: </Text>
              <DateTimeSelectorComponent dateTime={installationTime ?? new Date()} onDateTimeChange={(newDateTime: Date) => setInstallationTime(newDateTime)} dateOrTime="time" />
            </View>
            { 
              (
                otherInstallations === END_OF_BOREHOLE_OTHER_INSTALLATIONS_WATER_STANDPIPE
                || otherInstallations === END_OF_BOREHOLE_OTHER_INSTALLATIONS_STANDPIPE_PIEZOMETER
              ) && (
                <WaterLevelInMetresInputQuestions
                  title="Water Level(m)"
                  waterLevelInMetresStr={waterLevelInMetresStr}
                  onChangeWaterLevelInMetresStr={setWaterLevelInMetresStr}
                />
              )
            }
          </>
        )
      }
      <View style={{ flexDirection: 'row' }}>
        <Text style={{ paddingVertical: 10 }}>Remarks: </Text>
        <View style={{ flex: 1 }}>
          <TextInput
            value={remarks}
            onChangeText={setRemarks}
            style={{ borderWidth: 0.5, padding: 10, textAlign: 'left' }}
            multiline={true}
          />
        </View>
      </View>
    </>
  );
}