import React, { useEffect, useState } from "react";
import { FlatList, Keyboard, Text, TouchableOpacity, View, type ViewProps } from "react-native";

import { styles } from "@/constants/styles";
import * as BlockFile from "@/interfaces/Block";
import { Block, BlockTypeId } from "@/interfaces/Block";
import { AsphaltBlockDetailsInputForm } from "./asphalt/AsphaltBlockDetailsInputForm";
import { ConcreteSlabBlockDetailsInputForm } from "./concreteSlab/ConcreteSlabBlockDetailsInputForm";
import { CustomBlockDetailsInputForm } from "./custom/CustomBlockDetailsInputForm";
import { HaBlockDetailsInputForm } from "./ha/HaBlockDetailsInputForm";
import { WashBoringBlockDetailsInputForm } from "./washBoring/WashBoringBlockDetailsInputForm";
import { SpecificBlockDetailsInputFormProps } from "@/components/blockDetailsInputForms/BlockDetailsInputForm";

const HAND_AUGER = 'Hand Auger' as const;
const WASH_BORING = 'Wash Boring' as const;
const CONCRETE_SLAB = 'Concrete Slab' as const;
const ASPHALT = 'Asphalt' as const;
const CUSTOM = 'Custom' as const;
const OPERATION_TYPES = [HAND_AUGER, WASH_BORING, CONCRETE_SLAB, ASPHALT, CUSTOM] as const;
type OperationType = typeof OPERATION_TYPES[number];
const BLOCK_TYPE_ID_TO_OPERATION_TYPE: Record<BlockTypeId, OperationType | null> = {
  [BlockFile.SPT_BLOCK_TYPE_ID]: null,
  [BlockFile.CORING_BLOCK_TYPE_ID]: null,
  [BlockFile.CAVITY_BLOCK_TYPE_ID]: null,
  [BlockFile.UD_BLOCK_TYPE_ID]: null,
  [BlockFile.MZ_BLOCK_TYPE_ID]: null,
  [BlockFile.PS_BLOCK_TYPE_ID]: null,
  [BlockFile.HA_BLOCK_TYPE_ID]: HAND_AUGER,
  [BlockFile.WASH_BORING_BLOCK_TYPE_ID]: WASH_BORING,
  [BlockFile.CONCRETE_SLAB_BLOCK_TYPE_ID]: CONCRETE_SLAB,
  [BlockFile.ASPHALT_BLOCK_TYPE_ID]: ASPHALT,
  [BlockFile.END_OF_BOREHOLE_BLOCK_TYPE_ID]: null,
  [BlockFile.CUSTOM_BLOCK_TYPE_ID]: CUSTOM,
  [BlockFile.VANE_SHEAR_TEST_BLOCK_TYPE_ID]: null,
  [BlockFile.FALLING_HEAD_PERMEABILITY_TEST_BLOCK_TYPE_ID]: null,
  [BlockFile.RISING_HEAD_PERMEABILITY_TEST_BLOCK_TYPE_ID]: null,
  [BlockFile.CONSTANT_HEAD_PERMEABILITY_TEST_BLOCK_TYPE_ID]: null,
  [BlockFile.LUGEON_TEST_BLOCK_TYPE_ID]: null,
  [BlockFile.PRESSUREMETER_TEST_BLOCK_TYPE_ID]: null,
} as const;

export function OthersInputForm({ boreholeId, inputBlock, setCheckAndReturnBlock, ...otherProps }: SpecificBlockDetailsInputFormProps) {
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
          <Text>{operationType ?? 'Select Others Type'}</Text>
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
      { operationType === 'Hand Auger' && <HaBlockDetailsInputForm boreholeId={boreholeId} inputBlock={inputBlock} setCheckAndReturnBlock={setCheckAndReturnBlock} /> }
      { operationType === 'Wash Boring' && <WashBoringBlockDetailsInputForm boreholeId={boreholeId} inputBlock={inputBlock} setCheckAndReturnBlock={setCheckAndReturnBlock} /> }
      { operationType === 'Concrete Slab' && <ConcreteSlabBlockDetailsInputForm boreholeId={boreholeId} inputBlock={inputBlock} setCheckAndReturnBlock={setCheckAndReturnBlock} /> }
      { operationType === 'Asphalt' && <AsphaltBlockDetailsInputForm boreholeId={boreholeId} inputBlock={inputBlock} setCheckAndReturnBlock={setCheckAndReturnBlock} /> }
      { operationType === 'Custom' && <CustomBlockDetailsInputForm boreholeId={boreholeId} inputBlock={inputBlock} setCheckAndReturnBlock={setCheckAndReturnBlock} /> }
    </>
  );
}
