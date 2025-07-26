import React, { useState } from "react";
import { FlatList, Keyboard, StyleSheet, Text, TouchableOpacity, View, type ViewProps } from "react-native";

import { AddCavityBlockDetailsInputForm } from "@/components/blockDetailsInputForms/coring&cavity/cavity/AddCavityBlockDetailsInputForm";
import { AddCoringBlockDetailsInputForm } from "@/components/blockDetailsInputForms/coring&cavity/coring/AddCoringBlockDetailsInputForm";
import { Block } from "@/interfaces/Block";
import { styles } from "@/constants/styles";

export type CoringAndCavityBlockDetailsInputFormProps = ViewProps & {
  boreholeId: number;
  blocks: Block[];
  setBlocks: React.Dispatch<React.SetStateAction<Block[]>>;
  setIsAddNewBlockButtonPressed: React.Dispatch<React.SetStateAction<boolean>>;
};

export function CoringAndCavityBlockDetailsInputForm({ style, boreholeId, blocks, setBlocks, setIsAddNewBlockButtonPressed, ...otherProps }: CoringAndCavityBlockDetailsInputFormProps) {
  const [isSelectOperationTypePressed, setIsSelectOperationTypePressed] = useState<boolean>(true);
  const [operationType, setOperationType] = useState<string>('Select Coring or Cavity');

  return (
    <>
    <View>
      <TouchableOpacity 
        onPress={() => {
          Keyboard.dismiss();
          setIsSelectOperationTypePressed(prev => !prev);
        }}
        style={{ 
          backgroundColor: 'yellow',
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
                  Keyboard.dismiss();
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
        <AddCoringBlockDetailsInputForm 
          boreholeId={boreholeId}
          blocks={blocks}
          setBlocks={setBlocks}
          setIsAddNewBlockButtonPressed={setIsAddNewBlockButtonPressed}
        /> 
      )
    }
    { 
      operationType === 'Cavity' && (
        <AddCavityBlockDetailsInputForm 
          boreholeId={boreholeId}
          blocks={blocks}
          setBlocks={setBlocks}
          setIsAddNewBlockButtonPressed={setIsAddNewBlockButtonPressed}
        /> 
      )
    }
    </>
  );
}
