import React, { useEffect, useState } from "react";
import { FlatList, Keyboard, StyleSheet, Text, TouchableOpacity, View, type ViewProps } from "react-native";

import { MzBlockDetailsInputForm } from "@/components/blockDetailsInputForms/undisturbedSample/mz/MzBlockDetailsInputForm";
import { PsBlockDetailsInputForm } from "@/components/blockDetailsInputForms/undisturbedSample/ps/PsBlockDetailsInputForm";
import { UdBlockDetailsInputForm } from "@/components/blockDetailsInputForms/undisturbedSample/ud/UdBlockDetailsInputForm";
import * as BlockFile from "@/interfaces/Block";
import { Block, BlockTypeId } from "@/interfaces/Block";
import { styles } from "@/constants/styles";
import { SpecificBlockDetailsInputFormProps } from "@/components/blockDetailsInputForms/BlockDetailsInputForm";

const UD = 'UD' as const;
const MZ = 'MZ' as const;
const PS = 'PS' as const;
const OPERATION_TYPES = [UD, MZ, PS] as const;
type OperationType = typeof OPERATION_TYPES[number];
const BLOCK_TYPE_ID_TO_OPERATION_TYPE: Record<BlockTypeId, OperationType | null> = {
  [BlockFile.SPT_BLOCK_TYPE_ID]: null,
  [BlockFile.CORING_BLOCK_TYPE_ID]: null,
  [BlockFile.CAVITY_BLOCK_TYPE_ID]: null,
  [BlockFile.UD_BLOCK_TYPE_ID]: UD,
  [BlockFile.MZ_BLOCK_TYPE_ID]: MZ,
  [BlockFile.PS_BLOCK_TYPE_ID]: PS,
  [BlockFile.HA_BLOCK_TYPE_ID]: null,
  [BlockFile.WASH_BORING_BLOCK_TYPE_ID]: null,
  [BlockFile.CONCRETE_SLAB_BLOCK_TYPE_ID]: null,
  [BlockFile.ASPHALT_BLOCK_TYPE_ID]: null,
  [BlockFile.END_OF_BOREHOLE_BLOCK_TYPE_ID]: null,
  [BlockFile.CUSTOM_BLOCK_TYPE_ID]: null,
  [BlockFile.VANE_SHEAR_TEST_BLOCK_TYPE_ID]: null,
  [BlockFile.FALLING_HEAD_PERMEABILITY_TEST_BLOCK_TYPE_ID]: null,
  [BlockFile.RISING_HEAD_PERMEABILITY_TEST_BLOCK_TYPE_ID]: null,
  [BlockFile.CONSTANT_HEAD_PERMEABILITY_TEST_BLOCK_TYPE_ID]: null,
  [BlockFile.LUGEON_TEST_BLOCK_TYPE_ID]: null,
  [BlockFile.PRESSUREMETER_TEST_BLOCK_TYPE_ID]: null,
} as const;

export function UndisturbedSampleInputForm({ boreholeId, inputBlock, setCheckAndReturnBlock, ...otherProps }: SpecificBlockDetailsInputFormProps) {
  const [isSelectOperationTypePressed, setIsSelectOperationTypePressed] = useState<boolean>((inputBlock === null || BLOCK_TYPE_ID_TO_OPERATION_TYPE[inputBlock.blockTypeId] === null) ? true : false);
  const [operationType, setOperationType] = useState<OperationType | null>((inputBlock === null) ? null : BLOCK_TYPE_ID_TO_OPERATION_TYPE[inputBlock.blockTypeId]);

  useEffect(() => setCheckAndReturnBlock(null), []);

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
          <Text>{operationType ?? 'Select Undisturbed Sample Type'}</Text>
        </TouchableOpacity>
        {
          isSelectOperationTypePressed && (
            OPERATION_TYPES.map((item) => (
              <TouchableOpacity
                key={item}
                onPress={() => {
                  Keyboard.dismiss();
                  setOperationType(item);
                  setIsSelectOperationTypePressed(false);
                }}
                style={[styles.listItem]}>
                <Text>{item}</Text>
              </TouchableOpacity>
            ))
          )
        }
      </View>
      { operationType === 'UD' && <UdBlockDetailsInputForm boreholeId={boreholeId} inputBlock={inputBlock} setCheckAndReturnBlock={setCheckAndReturnBlock} /> }
      { operationType === 'MZ' && <MzBlockDetailsInputForm boreholeId={boreholeId} inputBlock={inputBlock} setCheckAndReturnBlock={setCheckAndReturnBlock} /> }
      { operationType === 'PS' && <PsBlockDetailsInputForm boreholeId={boreholeId} inputBlock={inputBlock} setCheckAndReturnBlock={setCheckAndReturnBlock} /> }
    </>
  );
}
