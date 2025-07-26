import React, { useState } from "react";
import { FlatList, Keyboard, StyleSheet, Text, TouchableOpacity, View, type ViewProps } from "react-native";

import { AddMzBlockDetailsInputForm } from "@/components/blockDetailsInputForms/undisturbedSample/mz/AddMzBlockDetailsInputForm";
import { AddPsBlockDetailsInputForm } from "@/components/blockDetailsInputForms/undisturbedSample/ps/AddPsBlockDetailsInputForm";
import { AddUdBlockDetailsInputForm } from "@/components/blockDetailsInputForms/undisturbedSample/ud/AddUdBlockDetailsInputForm";
import { Block } from "@/interfaces/Block";
import { styles } from "@/constants/styles";

export type UndisturbedSampleInputFormProps = ViewProps & {
  boreholeId: number;
  blocks: Block[];
  setBlocks: React.Dispatch<React.SetStateAction<Block[]>>;
  setIsAddNewBlockButtonPressed: React.Dispatch<React.SetStateAction<boolean>>;
};

export function UndisturbedSampleInputForm({ style, boreholeId, blocks, setBlocks, setIsAddNewBlockButtonPressed, ...otherProps }: UndisturbedSampleInputFormProps) {
  const [isSelectOperationTypePressed, setIsSelectOperationTypePressed] = useState<boolean>(true);
  const [operationType, setOperationType] = useState<string>('Select UD Type');

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
            data={['UD', 'MZ', 'PS']}
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
      operationType === 'UD' && (
        <AddUdBlockDetailsInputForm 
          boreholeId={boreholeId}
          blocks={blocks}
          setBlocks={setBlocks}
          setIsAddNewBlockButtonPressed={setIsAddNewBlockButtonPressed}
        /> 
      )
    }
    { 
      operationType === 'MZ' && (
        <AddMzBlockDetailsInputForm 
          boreholeId={boreholeId}
          blocks={blocks}
          setBlocks={setBlocks}
          setIsAddNewBlockButtonPressed={setIsAddNewBlockButtonPressed}
        /> 
      )
    }
    { 
      operationType === 'PS' && (
        <AddPsBlockDetailsInputForm 
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
