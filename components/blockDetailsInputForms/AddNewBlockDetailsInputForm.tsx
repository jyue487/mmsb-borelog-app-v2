import React, { useState } from "react";
import { Button, FlatList, Keyboard, Text, TouchableOpacity, View, type ViewProps } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { CoringAndCavityBlockDetailsInputForm } from '@/components/blockDetailsInputForms/coring&cavity/CoringAndCavityBlockDetailsInputForm';
import { OthersInputForm } from "@/components/blockDetailsInputForms/others/OthersInputForm";
import { AddSptBlockDetailsInputForm } from '@/components/blockDetailsInputForms/spt/AddSptBlockDetailsInputForm';
import { UndisturbedSampleInputForm } from '@/components/blockDetailsInputForms/undisturbedSample/UndisturbedSampleInputForm';
import { styles } from "@/constants/styles";
import { Block } from "@/interfaces/Block";
import { RequiredInsituTestsInputForm } from "./requiredInsituTests/RequiredInsituTestsInputForm";
import { AddEndOfBoreholeBlockDetailsInputForm } from "./endOfBorehole/AddEndOfBoreholeBlockDetailsInputForm";

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
    <GestureHandlerRootView style={styles.blockDetailsInputForm}>
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
              data={[
                'SPT', 
                'Coring & Cavity', 
                'Undisturbed Sample', 
                'Required In-situ Tests', 
                'End of Borehole', 
                'Others'
              ]}
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
        operationType === 'Required In-situ Tests' && (
          <RequiredInsituTestsInputForm
            boreholeId={boreholeId}
            blocks={blocks}
            setBlocks={setBlocks}
            setIsAddNewBlockButtonPressed={setIsAddNewBlockButtonPressed}
          /> 
        )
      }
      { 
        operationType === 'End of Borehole' && (
          <AddEndOfBoreholeBlockDetailsInputForm
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
