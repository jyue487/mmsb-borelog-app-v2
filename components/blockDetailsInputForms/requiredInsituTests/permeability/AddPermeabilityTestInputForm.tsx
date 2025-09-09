import React, { useState } from "react";
import { FlatList, Keyboard, Text, TouchableOpacity, View, type ViewProps } from "react-native";

import { styles } from "@/constants/styles";
import { Block } from "@/interfaces/Block";
import { AddConstantHeadPermeabilityTestBlockDetailsInputForm } from "./constantHead/AddConstantHeadPermeabilityTestBlockDetailsInputForm";
import { AddFallingHeadPermeabilityTestBlockDetailsInputForm } from "./fallingHead/AddFallingHeadPermeabilityTestBlockDetailsInputForm";
import { AddRisingHeadPermeabilityTestBlockDetailsInputForm } from "./risingHead/AddRisingHeadPermeabilityTestBlockDetailsInputForm";

export type AddPermeabilityTestInputFormProps = ViewProps & {
  boreholeId: number;
  blocks: Block[];
  setBlocks: React.Dispatch<React.SetStateAction<Block[]>>;
  setIsAddNewBlockButtonPressed: React.Dispatch<React.SetStateAction<boolean>>;
};

export function AddPermeabilityTestInputForm({ style, boreholeId, blocks, setBlocks, setIsAddNewBlockButtonPressed, ...otherProps }: AddPermeabilityTestInputFormProps) {
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
              'Falling Head',
              'Rising Head',
              'Constant Head',
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
      operationType === 'Falling Head' && (
        <AddFallingHeadPermeabilityTestBlockDetailsInputForm 
          boreholeId={boreholeId}
          blocks={blocks}
          setBlocks={setBlocks}
          setIsAddNewBlockButtonPressed={setIsAddNewBlockButtonPressed}
        /> 
      )
    }
    { 
      operationType === 'Rising Head' && (
        <AddRisingHeadPermeabilityTestBlockDetailsInputForm 
          boreholeId={boreholeId}
          blocks={blocks}
          setBlocks={setBlocks}
          setIsAddNewBlockButtonPressed={setIsAddNewBlockButtonPressed}
        /> 
      )
    }
    { 
      operationType === 'Constant Head' && (
        <AddConstantHeadPermeabilityTestBlockDetailsInputForm 
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
