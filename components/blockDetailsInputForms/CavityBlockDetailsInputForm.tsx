import React, { useState } from "react";
import { Button, Keyboard, StyleSheet, Text, TextInput, TouchableOpacity, View, type ViewProps } from "react-native";
import { FlatList, GestureHandlerRootView } from "react-native-gesture-handler";

import { CAVITY_BLOCK_TYPE_ID } from "@/constants/BlockTypeId";
import { Block } from "@/types/Block";

export type CavityBlockDetailsInputFormProps = ViewProps & {
  boreholeId: number;
  blocks: Block[];
  setBlocks: React.Dispatch<React.SetStateAction<Block[]>>;
  setIsAddNewBlockButtonPressed: (isPressed: boolean) => void;
};

export function CavityBlockDetailsInputForm({ style, boreholeId, blocks, setBlocks, setIsAddNewBlockButtonPressed, ...otherProps }: CavityBlockDetailsInputFormProps) {
  const [topDepthInMetresStr, setTopDepthInMetresStr] = useState<string>('');
  const [baseDepthInMetresStr, setBaseDepthInMetresStr] = useState<string>('');
  const [cavityDescription, setCavityDescription] = useState<string>('');
  const [isSelectCavityDescriptionPressed, setIsSelectCavityDescriptionPressed] = useState<boolean>(false);

  return (
    <GestureHandlerRootView>
      <View style={{ paddingVertical: 20, gap: 20 }}>
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
      </View>
      <Button
        title='Confirm'
        onPress={() => {
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

          const newCavityBlock: Block = {
            id: blocks.length + 1,
            blockTypeId: CAVITY_BLOCK_TYPE_ID,
            blockType: 'Cavity',
            boreholeId: boreholeId, 
            blockId: 1,
            topDepthInMetres: topDepthInMetres,
            baseDepthInMetres: baseDepthInMetres,
            cavityDescription: cavityDescription,
          };
          setBlocks(blocks => [...blocks, newCavityBlock]);
          setIsAddNewBlockButtonPressed(false);
        }}
      />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  listItem: {
    borderLeftWidth: 0.25,
    borderRightWidth: 0.25,
    borderBottomWidth: 0.25,
    alignItems: 'center',
    padding: 10,
  }
});