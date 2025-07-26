import React, { useState } from "react";
import { Button, FlatList, Keyboard, StyleSheet, Text, TouchableOpacity, View, type ViewProps } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { AddSptBlockDetailsInputForm } from '@/components/blockDetailsInputForms/spt/AddSptBlockDetailsInputForm';
import { CoringAndCavityBlockDetailsInputForm } from '@/components/blockDetailsInputForms/coring&cavity/CoringAndCavityBlockDetailsInputForm';
import { OthersInputForm } from "@/components/blockDetailsInputForms/others/OthersInputForm";
import { UndisturbedSampleInputForm } from '@/components/blockDetailsInputForms/undisturbedSample/UndisturbedSampleInputForm';
import { Block } from "@/interfaces/Block";
import { styles } from "@/constants/styles";

export type AddNewBlockDetailsInputFormProps = ViewProps & {
  blocks: Block[];
  setBlocks: React.Dispatch<React.SetStateAction<Block[]>>;
  boreholeId: number;

  setIsAddNewBlockButtonPressed: React.Dispatch<React.SetStateAction<boolean>>;
};

export function AddNewBlockDetailsInputForm({ style, blocks, setBlocks, boreholeId, setIsAddNewBlockButtonPressed, ...otherProps }: AddNewBlockDetailsInputFormProps) {
  const [isSelectOperationTypePressed, setIsSelectOperationTypePressed] = useState<boolean>(true);
  const [operationType, setOperationType] = useState<string>('Select Operation Type');

  return (
    <GestureHandlerRootView style={styles.inputForm}>
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
              data={['SPT', 'Coring & Cavity', 'Undisturbed Sample', 'Others']}
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
        operationType === 'SPT' && (
          <AddSptBlockDetailsInputForm 
            blocks={blocks}
            setBlocks={setBlocks}
            boreholeId={boreholeId}
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
      { 
        operationType === 'Others' && (
          <OthersInputForm
            boreholeId={boreholeId}
            blocks={blocks}
            setBlocks={setBlocks}
            setIsAddNewBlockButtonPressed={setIsAddNewBlockButtonPressed}
          /> 
        )
      }
      <Button
        title='Cancel'
        onPress={() => {
          setIsAddNewBlockButtonPressed(false);
        }}
      />
    </GestureHandlerRootView>
  );
}
