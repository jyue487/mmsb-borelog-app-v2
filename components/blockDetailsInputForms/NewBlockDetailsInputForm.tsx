import React, { useState } from "react";
import { FlatList, Keyboard, StyleSheet, Text, TouchableOpacity, View, type ViewProps } from "react-native";


import { CoringAndCavityBlockDetailsInputForm } from '@/components/blockDetailsInputForms/CoringAndCavityBlockDetailsInputForm';
import { SptBlockDetailsInputForm } from '@/components/blockDetailsInputForms/SptBlockDetailsInputForm';
import { UndisturbedSampleInputForm } from '@/components/blockDetailsInputForms/UndisturbedSampleInputForm';
import { Block } from "@/interfaces/Block";

export type NewBlockDetailsInputFormProps = ViewProps & {
  boreholeId: number;
  blocks: Block[];
  setBlocks: React.Dispatch<React.SetStateAction<Block[]>>;
  setIsAddNewBlockButtonPressed: React.Dispatch<React.SetStateAction<boolean>>;
};

export function NewBlockDetailsInputForm({ style, boreholeId, blocks, setBlocks, setIsAddNewBlockButtonPressed, ...otherProps }: NewBlockDetailsInputFormProps) {
  const [isSelectOperationTypePressed, setIsSelectOperationTypePressed] = useState<boolean>(false);
  const [operationType, setOperationType] = useState<string>('Select Operation Type');

  return (
    <View style={{ gap: 20 }}>
      <View>
        <TouchableOpacity 
          onPress={() => {
            Keyboard.dismiss();
            setIsSelectOperationTypePressed(prev => !prev);
          }}
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
              data={['SPT', 'Coring & Cavity', 'Undisturbed Sample']}
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
        operationType === 'SPT' && (
          <SptBlockDetailsInputForm 
            boreholeId={boreholeId}
            blocks={blocks}
            setBlocks={setBlocks}
            setIsAddNewBlockButtonPressed={setIsAddNewBlockButtonPressed}
          />
        )
      }
      { 
        operationType === 'Coring & Cavity' && (
          <CoringAndCavityBlockDetailsInputForm 
            boreholeId={boreholeId}
            blocks={blocks}
            setBlocks={setBlocks}
            setIsAddNewBlockButtonPressed={setIsAddNewBlockButtonPressed}
          /> 
        )
      }
      { 
        operationType === 'Undisturbed Sample' && (
          <UndisturbedSampleInputForm
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