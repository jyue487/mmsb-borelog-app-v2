import { END_OF_BOREHOLE_BLOCK_TYPE_ID } from "@/constants/BlockTypeId";
import { DAY_CONTINUE_WORK_TYPE } from "@/constants/DayStatus";
import { styles } from "@/constants/styles";
import { Block, END_OF_BOREHOLE_BLOCK_TYPE } from "@/interfaces/Block";
import { isNonNegativeFloat, stringToDecimalPoint } from "@/utils/numbers";
import { useState } from "react";
import { Button, FlatList, Keyboard, Text, TextInput, TouchableOpacity, View, ViewProps } from "react-native";

export type AddEndOfBoreholeBlockDetailsInputFormProps = ViewProps & {
  boreholeId: number;
  blocks: Block[];
  setBlocks: React.Dispatch<React.SetStateAction<Block[]>>;
  setIsAddNewBlockButtonPressed: React.Dispatch<React.SetStateAction<boolean>>;
};

export function AddEndOfBoreholeBlockDetailsInputForm({
  blocks,
  setBlocks,
  boreholeId,
  setIsAddNewBlockButtonPressed,
}: AddEndOfBoreholeBlockDetailsInputFormProps) {

  const [otherInstallations, setOtherInstallations] = useState<string>('None');
  const [isSelectOtherInstallationsPressed, setIsSelectOtherInstallationsPressed] = useState<boolean>(false);
  const [customInstallations, setCustomInstallations] = useState<string>('');
  const [installationDepthInMetresStr, setInstallationDepthStr] = useState<string>('');
  const [remarks, setRemarks] = useState<string>('');

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
            onChangeText={setInstallationDepthStr}
            style={{ borderWidth: 0.5, alignItems: 'center', padding: 10, flex: 1 }}
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
        />
      </View>
    </View>
    <Button
      title='Confirm'
      onPress={() => {
        if (blocks.length === 0) {
          alert("Error: Borelog is empty");
          return;
        }
        const endOfBoreholeDepthInMetres: number = blocks[blocks.length - 1].baseDepthInMetres;

        let installationDepthInMetres: number | null = null;
        let description: string = `End of BH at ${endOfBoreholeDepthInMetres}m`;
        if (otherInstallations !== 'None') {
          if (!isNonNegativeFloat(installationDepthInMetresStr)) {
            alert('Error: Installation Depth');
            return;
          }
          installationDepthInMetres = stringToDecimalPoint(installationDepthInMetresStr, 3);
          if (otherInstallations === 'Custom') {
            description += ` with installation of ${customInstallations.trim()}`;
          } else {
            description += ` with installation of ${otherInstallations}`;
          }
          description += ` to ${installationDepthInMetres}m`;

          if (remarks.trim().length > 0) {
            description += `. Remarks: ${remarks}`;
          }
        }
        const newBlock: Block = {
          id: blocks.length + 1,
          blockId: blocks.length + 1,
          boreholeId: boreholeId,
          blockTypeId: END_OF_BOREHOLE_BLOCK_TYPE_ID,
          blockType: END_OF_BOREHOLE_BLOCK_TYPE,
          dayWorkStatus: { dayWorkStatusType: DAY_CONTINUE_WORK_TYPE },
          topDepthInMetres: endOfBoreholeDepthInMetres,
          baseDepthInMetres: endOfBoreholeDepthInMetres,
          description: description,
          otherInstallations: otherInstallations,
          customInstallations: customInstallations,
          installationDepthInMetres: installationDepthInMetres,
          remarks: remarks,
        };
        setBlocks(blocks => [...blocks, newBlock]);
        setIsAddNewBlockButtonPressed(false);
      }}
    />
    </>
  );
}