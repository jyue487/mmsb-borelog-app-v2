import React, { useState } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View, type ViewProps } from "react-native";

import { CavityBlockDetailsInputForm } from "@/components/blockDetailsInputForms/CavityBlockDetailsInputForm";
import { CoringBlockDetailsInputForm } from "@/components/blockDetailsInputForms/CoringBlockDetailsInputForm";
import { Block } from "@/interfaces/Block";

export type CoringAndCavityBlockDetailsInputFormProps = ViewProps & {
  boreholeId: number;
  blocks: Block[];
  setBlocks: React.Dispatch<React.SetStateAction<Block[]>>;
  setIsAddNewBlockButtonPressed: React.Dispatch<React.SetStateAction<boolean>>;
};

export function CoringAndCavityBlockDetailsInputForm({ style, boreholeId, blocks, setBlocks, setIsAddNewBlockButtonPressed, ...otherProps }: CoringAndCavityBlockDetailsInputFormProps) {
  const [isSelectOperationTypePressed, setIsSelectOperationTypePressed] = useState<boolean>(false);
  const [operationType, setOperationType] = useState<string>('Select Operation Type');

  return (
    <View style={{ gap: 20 }}>
      <View>
        <TouchableOpacity 
          onPress={() => setIsSelectOperationTypePressed(prev => !prev)}
          style={{ 
            borderWidth: 0.5, 
            alignItems: 'center',
            padding: 10,
          }}>
          <Text>{operationType}</Text>
        </TouchableOpacity>
        {
          isSelectOperationTypePressed && (
            <FlatList
              data={['Coring', 'Cavity']}
              keyExtractor={item => item}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  onPress={() => {
                    setOperationType(item);
                    setIsSelectOperationTypePressed(false);
                  }}
                  style={[styles.listItem]}>
                  <Text>{item}</Text>
                </TouchableOpacity>
              )}
            />
          )
        }
      </View>
      { 
        operationType === 'Coring' && (
          <CoringBlockDetailsInputForm 
            boreholeId={boreholeId}
            blocks={blocks}
            setBlocks={setBlocks}
            setIsAddNewBlockButtonPressed={setIsAddNewBlockButtonPressed}
          /> 
        )
      }
      { 
        operationType === 'Cavity' && (
          <CavityBlockDetailsInputForm 
            boreholeId={boreholeId}
            blocks={blocks}
            setBlocks={setBlocks}
            setIsAddNewBlockButtonPressed={setIsAddNewBlockButtonPressed}
          /> 
        )
      }
    </View>
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