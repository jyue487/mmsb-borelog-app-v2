import React, { useState } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View, type ViewProps } from "react-native";

import { MzBlockDetailsInputForm } from "@/components/blockDetailsInputForms/MzBlockDetailsInputForm";
import { PsBlockDetailsInputForm } from "@/components/blockDetailsInputForms/PsBlockDetailsInputForm";
import { UdBlockDetailsInputForm } from "@/components/blockDetailsInputForms/UdBlockDetailsInputForm";
import { Block } from "@/interfaces/Block";

export type UndisturbedSampleInputFormProps = ViewProps & {
  boreholeId: number;
  blocks: Block[];
  setBlocks: React.Dispatch<React.SetStateAction<Block[]>>;
  setIsAddNewBlockButtonPressed: React.Dispatch<React.SetStateAction<boolean>>;
};

export function UndisturbedSampleInputForm({ style, boreholeId, blocks, setBlocks, setIsAddNewBlockButtonPressed, ...otherProps }: UndisturbedSampleInputFormProps) {
  const [isSelectOperationTypePressed, setIsSelectOperationTypePressed] = useState<boolean>(false);
  const [operationType, setOperationType] = useState<string>('Select Operation Type');

  return (
    <View style={{ gap: 20 }}>
      <View>
        <TouchableOpacity 
          onPress={() => setIsSelectOperationTypePressed(prev => !prev)}
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
              data={['UD', 'MZ', 'PS']}
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
        operationType === 'UD' && (
          <UdBlockDetailsInputForm 
            boreholeId={boreholeId}
            blocks={blocks}
            setBlocks={setBlocks}
            setIsAddNewBlockButtonPressed={setIsAddNewBlockButtonPressed}
          /> 
        )
      }
      { 
        operationType === 'MZ' && (
          <MzBlockDetailsInputForm 
            boreholeId={boreholeId}
            blocks={blocks}
            setBlocks={setBlocks}
            setIsAddNewBlockButtonPressed={setIsAddNewBlockButtonPressed}
          /> 
        )
      }
      { 
        operationType === 'PS' && (
          <PsBlockDetailsInputForm 
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