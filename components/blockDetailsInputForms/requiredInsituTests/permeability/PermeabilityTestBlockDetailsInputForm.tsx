import React, { useEffect, useState } from "react";
import { FlatList, Keyboard, Text, TouchableOpacity, View, type ViewProps } from "react-native";

import { styles } from "@/constants/styles";
import { Block, BlockTypeId } from "@/interfaces/Block";
import * as BlockFile from "@/interfaces/Block";
import { ConstantHeadPermeabilityTestBlockDetailsInputForm } from "./constantHead/ConstantHeadPermeabilityTestBlockDetailsInputForm";
import { FallingHeadPermeabilityTestBlockDetailsInputForm } from "./fallingHead/FallingHeadPermeabilityTestBlockDetailsInputForm";
import { RisingHeadPermeabilityTestBlockDetailsInputForm } from "./risingHead/RisingHeadPermeabilityTestBlockDetailsInputForm";
import { SpecificBlockDetailsInputFormProps } from "@/components/blockDetailsInputForms/BlockDetailsInputForm";

const FALLING_HEAD = 'Falling Head' as const;
const RISING_HEAD = 'Rising Head' as const;
const CONSTANT_HEAD = 'Constant Head' as const;
const OPERATION_TYPES = [FALLING_HEAD, RISING_HEAD, CONSTANT_HEAD] as const;
type OperationType = typeof OPERATION_TYPES[number];
const BLOCK_TYPE_ID_TO_OPERATION_TYPE: Record<BlockTypeId, OperationType | null> = {
  [BlockFile.SPT_BLOCK_TYPE_ID]: null,
  [BlockFile.CORING_BLOCK_TYPE_ID]: null,
  [BlockFile.CAVITY_BLOCK_TYPE_ID]: null,
  [BlockFile.UD_BLOCK_TYPE_ID]: null,
  [BlockFile.MZ_BLOCK_TYPE_ID]: null,
  [BlockFile.PS_BLOCK_TYPE_ID]: null,
  [BlockFile.HA_BLOCK_TYPE_ID]: null,
  [BlockFile.WASH_BORING_BLOCK_TYPE_ID]: null,
  [BlockFile.CONCRETE_SLAB_BLOCK_TYPE_ID]: null,
  [BlockFile.ASPHALT_BLOCK_TYPE_ID]: null,
  [BlockFile.END_OF_BOREHOLE_BLOCK_TYPE_ID]: null,
  [BlockFile.CUSTOM_BLOCK_TYPE_ID]: null,
  [BlockFile.VANE_SHEAR_TEST_BLOCK_TYPE_ID]: null,
  [BlockFile.FALLING_HEAD_PERMEABILITY_TEST_BLOCK_TYPE_ID]: FALLING_HEAD,
  [BlockFile.RISING_HEAD_PERMEABILITY_TEST_BLOCK_TYPE_ID]: RISING_HEAD,
  [BlockFile.CONSTANT_HEAD_PERMEABILITY_TEST_BLOCK_TYPE_ID]: CONSTANT_HEAD,
  [BlockFile.LUGEON_TEST_BLOCK_TYPE_ID]: null,
  [BlockFile.PRESSUREMETER_TEST_BLOCK_TYPE_ID]: null,
} as const;

export function PermeabilityTestBlockDetailsInputForm({ boreholeId, inputBlock, setCheckAndReturnBlock, ...otherProps }: SpecificBlockDetailsInputFormProps) {
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
          <Text>{operationType ?? 'Select Permeability Test Type'}</Text>
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
      {operationType === 'Falling Head' && <FallingHeadPermeabilityTestBlockDetailsInputForm boreholeId={boreholeId} inputBlock={inputBlock} setCheckAndReturnBlock={setCheckAndReturnBlock} /> }
      {operationType === 'Rising Head' && <RisingHeadPermeabilityTestBlockDetailsInputForm boreholeId={boreholeId} inputBlock={inputBlock} setCheckAndReturnBlock={setCheckAndReturnBlock} /> }
      {operationType === 'Constant Head' && <ConstantHeadPermeabilityTestBlockDetailsInputForm boreholeId={boreholeId} inputBlock={inputBlock} setCheckAndReturnBlock={setCheckAndReturnBlock} /> }
    </>
  );
}
