import React, { useState } from "react";
import { FlatList, Keyboard, Text, TouchableOpacity, View, type ViewProps } from "react-native";

import { styles } from "@/constants/styles";
import { Block } from "@/interfaces/Block";
import { AddLugeonTestBlockDetailsInputForm } from "./lugeon/AddLugeonTestBlockDetailsInputForm";
import { AddPermeabilityTestInputForm } from "./permeability/AddPermeabilityTestInputForm";
import { AddPressuremeterTestBlockDetailsInputForm } from "./pressuremeter/AddPressuremeterTestBlockDetailsInputForm";
import { AddVaneShearTestBlockDetailsInputForm } from "./vaneShear/AddVaneShearTestBlockDetailsInputForm";

export type RequiredInsituTestsInputFormProps = ViewProps & {
  boreholeId: number;
  blocks: Block[];
  setBlocks: React.Dispatch<React.SetStateAction<Block[]>>;
  setIsAddNewBlockButtonPressed: React.Dispatch<React.SetStateAction<boolean>>;
};

export function RequiredInsituTestsInputForm({ style, boreholeId, blocks, setBlocks, setIsAddNewBlockButtonPressed, ...otherProps }: RequiredInsituTestsInputFormProps) {
  const [isSelectOperationTypePressed, setIsSelectOperationTypePressed] = useState<boolean>(true);
  const [operationType, setOperationType] = useState<string>('Select In-situ Test Type');

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
            data={[
              'Vane Shear Test',
              'Pressuremeter Test',
              'Lugeon Test',
              'Permeability Test',
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
      operationType === 'Vane Shear Test' && (
        <AddVaneShearTestBlockDetailsInputForm 
          boreholeId={boreholeId} 
          blocks={blocks} 
          setBlocks={setBlocks} 
          setIsAddNewBlockButtonPressed={setIsAddNewBlockButtonPressed} 
        /> 
      )
    }
    { 
      operationType === 'Pressuremeter Test' && (
        <AddPressuremeterTestBlockDetailsInputForm 
          boreholeId={boreholeId} 
          blocks={blocks} 
          setBlocks={setBlocks} 
          setIsAddNewBlockButtonPressed={setIsAddNewBlockButtonPressed} 
        /> 
      )
    }
    { 
      operationType === 'Lugeon Test' && (
        <AddLugeonTestBlockDetailsInputForm 
          boreholeId={boreholeId} 
          blocks={blocks} 
          setBlocks={setBlocks} 
          setIsAddNewBlockButtonPressed={setIsAddNewBlockButtonPressed} 
        /> 
      )
    }
    { 
      operationType === 'Permeability Test' && (
        <AddPermeabilityTestInputForm
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
