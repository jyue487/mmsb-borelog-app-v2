import { styles } from "@/constants/styles";
import { Block } from "@/interfaces/Block";
import { stringToDecimalPoint } from "@/utils/numbers";
import { useState } from "react";
import { FlatList, Keyboard, Text, TextInput, TouchableOpacity, View } from "react-native";

type Props = {
  blocks: Block[];
  otherInstallations: string; setOtherInstallations: React.Dispatch<React.SetStateAction<string>>;
  customInstallations: string; setCustomInstallations: React.Dispatch<React.SetStateAction<string>>;
  installationDepthInMetresStr: string; setInstallationDepthInMetresStr: React.Dispatch<React.SetStateAction<string>>;
  remarks: string; setRemarks: React.Dispatch<React.SetStateAction<string>>;
}

export function EndOfBoreholeInputQuestions({
  blocks,
  otherInstallations, setOtherInstallations,
  customInstallations, setCustomInstallations,
  installationDepthInMetresStr, setInstallationDepthInMetresStr,
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
            <FlatList
              data={[
                'None',
                'Water Standpipe',
                'Standpipe Piezometer',
                'Inclinometer',
                'Custom'
              ]}
              keyExtractor={item => item}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  onPress={() => {
                    Keyboard.dismiss();
                    setOtherInstallations(item);
                    setIsSelectOtherInstallationsPressed(false);
                  }}
                  style={[styles.listItem]}>
                  <Text>{item}</Text>
                </TouchableOpacity>
              )}
              style={{ maxHeight: 500 }}
            />
          )
        }
        {
          otherInstallations === 'Custom' && (
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
      otherInstallations !== 'None' && (
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
            style={{ borderWidth: 0.5, alignItems: 'center', padding: 10, width: 70 }}
            keyboardType='numeric'
          />
        </View>
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