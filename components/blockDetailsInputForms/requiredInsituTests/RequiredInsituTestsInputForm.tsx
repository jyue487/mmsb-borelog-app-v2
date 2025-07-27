import React, { useState } from "react";
import { FlatList, Keyboard, StyleSheet, Text, TouchableOpacity, View, type ViewProps } from "react-native";

import { Block } from "@/interfaces/Block";
import { styles } from "@/constants/styles";
import { AddVaneShearTestBlockDetailsInputForm } from "./vaneShear/AddVaneShearTestBlockDetailsInputForm";
import { AddPressuremeterTestBlockDetailsInputForm } from "./pressuremeter/AddPressuremeterTestBlockDetailsInputForm";
import { AddLugeonTestBlockDetailsInputForm } from "./lugeon/AddLugeonTestBlockDetailsInputForm";
import { AddPermeabilityTestBlockDetailsInputForm } from "./permeability/AddPermeabilityTestBlockDetailsInputForm";

export type RequiredInsituTestsInputFormProps = ViewProps & {
  boreholeId: number;
  blocks: Block[];
  setBlocks: React.Dispatch<React.SetStateAction<Block[]>>;
  setIsAddNewBlockButtonPressed: React.Dispatch<React.SetStateAction<boolean>>;
};

export function RequiredInsituTestsInputForm({ style, boreholeId, blocks, setBlocks, setIsAddNewBlockButtonPressed, ...otherProps }: RequiredInsituTestsInputFormProps) {
  const [isSelectOperationTypePressed, setIsSelectOperationTypePressed] = useState<boolean>(true);
  const [operationType, setOperationType] = useState<string>('Select Others Type');

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
              'Others',
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
        /> 
      )
    }
    { 
      operationType === 'Pressuremeter Test' && (
        <AddPressuremeterTestBlockDetailsInputForm 
        /> 
      )
    }
    { 
      operationType === 'Lugeon Test' && (
        <AddLugeonTestBlockDetailsInputForm 
        /> 
      )
    }
    { 
      operationType === 'Permeability Test' && (
        <AddPermeabilityTestBlockDetailsInputForm 
        /> 
      )
    }
    { 
      operationType === 'Others' && (
        <AddPermeabilityTestBlockDetailsInputForm 
        /> 
      )
    }
    </>
  );
}
