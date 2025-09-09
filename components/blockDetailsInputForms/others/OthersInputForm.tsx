import React, { useState } from "react";
import { FlatList, Keyboard, Text, TouchableOpacity, View, type ViewProps } from "react-native";

import { styles } from "@/constants/styles";
import { Block } from "@/interfaces/Block";
import { AddAsphaltBlockDetailsInputForm } from "./asphalt/AddAsphaltBlockDetailsInputForm";
import { AddConcreteSlabBlockDetailsInputForm } from "./concreteSlab/AddConcreteSlabBlockDetailsInputForm";
import { AddCustomBlockDetailsInputForm } from "./custom/AddCustomBlockDetailsInputForm";
import { AddHaBlockDetailsInputForm } from "./ha/AddHaBlockDetailsInputForm";
import { AddWashBoringBlockDetailsInputForm } from "./washBoring/AddWashBoringBlockDetailsInputForm";

export type OthersInputFormProps = ViewProps & {
  boreholeId: number;
  blocks: Block[];
  setBlocks: React.Dispatch<React.SetStateAction<Block[]>>;
  setIsAddNewBlockButtonPressed: React.Dispatch<React.SetStateAction<boolean>>;
};

export function OthersInputForm({ style, boreholeId, blocks, setBlocks, setIsAddNewBlockButtonPressed, ...otherProps }: OthersInputFormProps) {
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
              'Hand Auger', 
              'Wash Boring', 
              'Concrete Slab', 
              'Asphalt',
              'Custom'
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
      operationType === 'Hand Auger' && (
        <AddHaBlockDetailsInputForm 
        boreholeId={boreholeId}
        blocks={blocks}
        setBlocks={setBlocks}
        setIsAddNewBlockButtonPressed={setIsAddNewBlockButtonPressed}
        /> 
      )
    }
    { 
      operationType === 'Wash Boring' && (
        <AddWashBoringBlockDetailsInputForm 
          boreholeId={boreholeId}
          blocks={blocks}
          setBlocks={setBlocks}
          setIsAddNewBlockButtonPressed={setIsAddNewBlockButtonPressed}
        /> 
      )
    }
    { 
      operationType === 'Concrete Slab' && (
        <AddConcreteSlabBlockDetailsInputForm 
          boreholeId={boreholeId}
          blocks={blocks}
          setBlocks={setBlocks}
          setIsAddNewBlockButtonPressed={setIsAddNewBlockButtonPressed}
        /> 
      )
    }
    { 
      operationType === 'Asphalt' && (
        <AddAsphaltBlockDetailsInputForm 
          boreholeId={boreholeId}
          blocks={blocks}
          setBlocks={setBlocks}
          setIsAddNewBlockButtonPressed={setIsAddNewBlockButtonPressed}
        /> 
      )
    }
    { 
      operationType === 'Custom' && (
        <AddCustomBlockDetailsInputForm 
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
