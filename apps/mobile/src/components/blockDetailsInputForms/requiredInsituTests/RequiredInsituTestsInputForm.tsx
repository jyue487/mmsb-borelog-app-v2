import React, { useEffect, useState } from "react";
import { Keyboard, Text, TouchableOpacity, View } from "react-native";

import { SpecificBlockDetailsInputFormProps } from "@/src/components/blockDetailsInputForms/BlockDetailsInputForm";
import { styles } from "@/src/constants/styles";
import * as BlockFile from '@mmsb/core';
import { BlockTypeId } from '@mmsb/core';
import { LugeonTestBlockDetailsInputForm } from "./lugeon/LugeonTestBlockDetailsInputForm";
import { PermeabilityTestBlockDetailsInputForm } from "./permeability/PermeabilityTestBlockDetailsInputForm";
import { PressuremeterTestBlockDetailsInputForm } from "./pressuremeter/PressuremeterTestBlockDetailsInputForm";
import { VaneShearTestBlockDetailsInputForm } from "./vaneShear/VaneShearTestBlockDetailsInputForm";

const VANE_SHEAR_TEST = 'Vane Shear Test' as const;
const PRESSUREMETER_TEST = 'Pressuremeter Test' as const;
const LUGEON_TEST = 'Lugeon Test' as const;
const PERMEABILITY_TEST = 'Permeability Test' as const;
const OPERATION_TYPES = [VANE_SHEAR_TEST, PRESSUREMETER_TEST, LUGEON_TEST, PERMEABILITY_TEST] as const;
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
  [BlockFile.VANE_SHEAR_TEST_BLOCK_TYPE_ID]: VANE_SHEAR_TEST,
  [BlockFile.FALLING_HEAD_PERMEABILITY_TEST_BLOCK_TYPE_ID]: PERMEABILITY_TEST,
  [BlockFile.RISING_HEAD_PERMEABILITY_TEST_BLOCK_TYPE_ID]: PERMEABILITY_TEST,
  [BlockFile.CONSTANT_HEAD_PERMEABILITY_TEST_BLOCK_TYPE_ID]: PERMEABILITY_TEST,
  [BlockFile.LUGEON_TEST_BLOCK_TYPE_ID]: LUGEON_TEST,
  [BlockFile.PRESSUREMETER_TEST_BLOCK_TYPE_ID]: PRESSUREMETER_TEST,
} as const;

export function RequiredInsituTestsInputForm({ boreholeId, inputBlock, setCheckAndReturnBlock, ...otherProps }: SpecificBlockDetailsInputFormProps) {
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
        <Text>{operationType ?? 'Select In-situ Test Type'}</Text>
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
    { operationType === 'Vane Shear Test' && <VaneShearTestBlockDetailsInputForm boreholeId={boreholeId} inputBlock={inputBlock} setCheckAndReturnBlock={setCheckAndReturnBlock} /> }
    { operationType === 'Pressuremeter Test' && <PressuremeterTestBlockDetailsInputForm boreholeId={boreholeId} inputBlock={inputBlock} setCheckAndReturnBlock={setCheckAndReturnBlock} /> }
    { operationType === 'Lugeon Test' && <LugeonTestBlockDetailsInputForm boreholeId={boreholeId} inputBlock={inputBlock} setCheckAndReturnBlock={setCheckAndReturnBlock} /> }
    { operationType === 'Permeability Test' && <PermeabilityTestBlockDetailsInputForm boreholeId={boreholeId} inputBlock={inputBlock} setCheckAndReturnBlock={setCheckAndReturnBlock} /> }
    </>
  );
}
