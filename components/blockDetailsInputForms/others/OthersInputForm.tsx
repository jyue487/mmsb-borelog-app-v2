import React, { useState } from "react";
import { FlatList, Keyboard, StyleSheet, Text, TouchableOpacity, View, type ViewProps } from "react-native";

import { Block } from "@/interfaces/Block";
import { AddWashBoringBlockDetailsInputForm } from "./washBoring/AddWashBoringBlockDetailsInputForm";
import { AddConcretePremixBlockDetailsInputForm } from "./concretePremix/AddConcretePremixBlockDetailsInputForm";
import { AddConcreteSlabBlockDetailsInputForm } from "./concreteSlab/AddConcreteSlabBlockDetailsInputForm";
import { AddHaBlockDetailsInputForm } from "./ha/AddHaBlockDetailsInputForm";
import { styles } from "@/constants/styles";

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
              'Wash Boring', 
              'Hand Auger', 
              'Concrete Slab', 
              'Concrete Premix'
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
      operationType === 'Concrete Premix' && (
        <AddConcretePremixBlockDetailsInputForm 
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
