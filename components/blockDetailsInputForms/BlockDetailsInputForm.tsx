import React, { useState } from "react";
import { Alert, Button, Keyboard, Text, TouchableOpacity, View, type ViewProps } from "react-native";

import { CoringAndCavityBlockDetailsInputForm } from '@/components/blockDetailsInputForms/coring&cavity/CoringAndCavityBlockDetailsInputForm';
import { OthersInputForm } from "@/components/blockDetailsInputForms/others/OthersInputForm";
import { UndisturbedSampleInputForm } from '@/components/blockDetailsInputForms/undisturbedSample/UndisturbedSampleInputForm';
import { styles } from "@/constants/styles";
import { ASPHALT_BLOCK_TYPE_ID, Block, BlockTypeId, CAVITY_BLOCK_TYPE_ID, CONCRETE_SLAB_BLOCK_TYPE_ID, CONSTANT_HEAD_PERMEABILITY_TEST_BLOCK_TYPE_ID, CORING_BLOCK_TYPE_ID, CUSTOM_BLOCK_TYPE_ID, END_OF_BOREHOLE_BLOCK_TYPE_ID, FALLING_HEAD_PERMEABILITY_TEST_BLOCK_TYPE_ID, HA_BLOCK_TYPE_ID, LUGEON_TEST_BLOCK_TYPE_ID, MZ_BLOCK_TYPE_ID, PRESSUREMETER_TEST_BLOCK_TYPE_ID, PS_BLOCK_TYPE_ID, RISING_HEAD_PERMEABILITY_TEST_BLOCK_TYPE_ID, SPT_BLOCK_TYPE_ID, UD_BLOCK_TYPE_ID, VANE_SHEAR_TEST_BLOCK_TYPE_ID, WASH_BORING_BLOCK_TYPE_ID } from "@/interfaces/Block";
import { addBlockAsync } from "@/utils/block/addBlockFunctions/addBlockAsync";
import { deleteBlockAsync } from "@/utils/block/deleteBlockFunctions/deleteBlockAsync";
import { sortAndReindexAllBlocks } from "@/utils/block/handleAllBlocksFrontEnd/sortAndReindexAllBlocks";
import { reindexBlock } from "@/utils/block/reindexBlocksFunctions/reindexBlock";
import { TrashDeleteButton } from "../buttons/TrashDeleteButton";
import { CameraComponent } from "../camera/CameraComponent";
import { EndOfBoreholeBlockDetailsInputForm } from "./endOfBorehole/EndOfBoreholeBlockDetailsInputForm";
import { RequiredInsituTestsInputForm } from "./requiredInsituTests/RequiredInsituTestsInputForm";
import { SptBlockDetailsInputForm } from "./spt/SptBlockDetailsInputForm";

const SPT = 'SPT' as const;
const CORING_AND_CAVITY = 'Coring & Cavity' as const;
const UNDISTURBED_SAMPLE = 'Undisturbed Sample' as const;
const REQUIRED_INSITU_TESTS = 'Required In-situ Tests' as const;
const END_OF_BOREHOLE = 'End of Borehole' as const;
const OTHERS = 'Others' as const;

const OPERATION_TYPES = [
  SPT, 
  CORING_AND_CAVITY, 
  UNDISTURBED_SAMPLE, 
  REQUIRED_INSITU_TESTS, 
  END_OF_BOREHOLE, 
  OTHERS
] as const;
type OperationType = typeof OPERATION_TYPES[number];
const BLOCK_TYPE_ID_TO_OPERATION_TYPE: Record<BlockTypeId, OperationType> = {
  [SPT_BLOCK_TYPE_ID]: SPT,
  [CORING_BLOCK_TYPE_ID]: CORING_AND_CAVITY,
  [CAVITY_BLOCK_TYPE_ID]: CORING_AND_CAVITY,
  [UD_BLOCK_TYPE_ID]: UNDISTURBED_SAMPLE,
  [MZ_BLOCK_TYPE_ID]: UNDISTURBED_SAMPLE,
  [PS_BLOCK_TYPE_ID]: UNDISTURBED_SAMPLE,
  [HA_BLOCK_TYPE_ID]: OTHERS,
  [WASH_BORING_BLOCK_TYPE_ID]: OTHERS,
  [CONCRETE_SLAB_BLOCK_TYPE_ID]: OTHERS,
  [ASPHALT_BLOCK_TYPE_ID]: OTHERS,
  [END_OF_BOREHOLE_BLOCK_TYPE_ID]: END_OF_BOREHOLE,
  [CUSTOM_BLOCK_TYPE_ID]: OTHERS,
  [VANE_SHEAR_TEST_BLOCK_TYPE_ID]: REQUIRED_INSITU_TESTS,
  [FALLING_HEAD_PERMEABILITY_TEST_BLOCK_TYPE_ID]: REQUIRED_INSITU_TESTS,
  [RISING_HEAD_PERMEABILITY_TEST_BLOCK_TYPE_ID]: REQUIRED_INSITU_TESTS,
  [CONSTANT_HEAD_PERMEABILITY_TEST_BLOCK_TYPE_ID]: REQUIRED_INSITU_TESTS,
  [LUGEON_TEST_BLOCK_TYPE_ID]: REQUIRED_INSITU_TESTS,
  [PRESSUREMETER_TEST_BLOCK_TYPE_ID]: REQUIRED_INSITU_TESTS,
} as const;

export type SpecificBlockDetailsInputFormProps = ViewProps & {
  boreholeId: string;
  inputBlock: Block | null;
  setCheckAndReturnBlock: React.Dispatch<React.SetStateAction<(() => Block) | null>>;
};

export type BlockDetailsInputFormProps = ViewProps & {
  blocks: Block[];
  setBlocks: React.Dispatch<React.SetStateAction<Block[]>>;
  boreholeId: string;
  inputBlock: Block | null;
  setIsVisible: React.Dispatch<React.SetStateAction<boolean>>;
  action: 'add' | 'edit';
};

export function BlockDetailsInputForm({ style, blocks, setBlocks, boreholeId, inputBlock, setIsVisible, action, ...otherProps }: BlockDetailsInputFormProps) {
  const [isSelectOperationTypePressed, setIsSelectOperationTypePressed] = useState<boolean>((inputBlock === null) ? true : false);
  const [operationType, setOperationType] = useState<OperationType | null>((inputBlock === null) ? null : BLOCK_TYPE_ID_TO_OPERATION_TYPE[inputBlock.blockTypeId]);
  const [checkAndReturnBlock, setCheckAndReturnBlock] = useState<(() => Block) | null>(null);
  const [blockPhotosOnConfirmAsync, setBlockPhotosOnConfirmAsync] = useState<((newBlockId: string) => Promise<void>) | null>(null);
  const handleDeleteBlockAsync = async (blockId: string, blockTypeId: BlockTypeId) => {
    const blocksToReindex = await deleteBlockAsync(blocks, blockId);
    const reindexedBlocks = reindexBlock(blocksToReindex, blockTypeId);
    setBlocks(reindexedBlocks);
    setIsVisible(false);
  };
  const onSubmitAsync = async (newBlock: Block) => {
    const unsortedBlocks = await addBlockAsync((inputBlock === null) ? blocks : await deleteBlockAsync(blocks, inputBlock.id), newBlock);
    const sortedBlocks = sortAndReindexAllBlocks(unsortedBlocks);
    setBlocks(sortedBlocks);
  };

  return (
    <View style={styles.blockDetailsInputForm}>
      { 
        (inputBlock !== null) && (
          <TrashDeleteButton 
            onPress={() => {
              Alert.alert(
                "Delete Block",
                `Are you sure you want to delete this block?`,
                [
                  { text: 'No, go back', style: 'cancel' },
                  { text: 'Delete', style: 'destructive', 
                    onPress: async () => await handleDeleteBlockAsync(inputBlock.id, inputBlock.blockTypeId)
                  },
                ],
                { cancelable: true }
              );
            }}
            style={{ top: 0, left: 0, alignSelf: 'flex-start' }}
          />
        ) 
      }
      <View>
        <TouchableOpacity 
          onPress={() => {
            Keyboard.dismiss();
            setIsSelectOperationTypePressed(prev => !prev);
          }}
          style={{ backgroundColor: 'yellow', borderWidth: 0.5, alignItems: 'center', padding: 10 }}>
          <Text>{operationType ?? 'Select Operation Type'}</Text>
        </TouchableOpacity>
        {
          isSelectOperationTypePressed && OPERATION_TYPES.map((item) => (
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
        }
      </View>
      { operationType === 'SPT' && <SptBlockDetailsInputForm boreholeId={boreholeId} inputBlock={inputBlock} setCheckAndReturnBlock={setCheckAndReturnBlock} /> }
      { operationType === 'Coring & Cavity' && <CoringAndCavityBlockDetailsInputForm boreholeId={boreholeId} inputBlock={inputBlock} setCheckAndReturnBlock={setCheckAndReturnBlock} /> }
      { operationType === 'Undisturbed Sample' && <UndisturbedSampleInputForm boreholeId={boreholeId} inputBlock={inputBlock} setCheckAndReturnBlock={setCheckAndReturnBlock} /> }
      { operationType === 'Required In-situ Tests' && <RequiredInsituTestsInputForm boreholeId={boreholeId} inputBlock={inputBlock} setCheckAndReturnBlock={setCheckAndReturnBlock} /> }
      { operationType === 'End of Borehole' && <EndOfBoreholeBlockDetailsInputForm boreholeId={boreholeId} inputBlock={inputBlock} blocks={blocks} setCheckAndReturnBlock={setCheckAndReturnBlock} /> }
      { operationType === 'Others' && <OthersInputForm boreholeId={boreholeId} inputBlock={inputBlock} setCheckAndReturnBlock={setCheckAndReturnBlock} /> }
      <CameraComponent inputBlock={inputBlock} setBlockPhotosOnConfirmAsync={setBlockPhotosOnConfirmAsync} />
      {
        (checkAndReturnBlock !== null || blockPhotosOnConfirmAsync !== null) && (
          <Button
            title="Confirm"
            color={styles.confirmButton.color}
            onPress={async () => {
              try {
                let newBlockId = (inputBlock !== null) ? inputBlock.id : '';
                if (checkAndReturnBlock !== null) {
                  console.log('checkAndReturnBlock running');
                  const newBlock = checkAndReturnBlock();
                  newBlockId = newBlock.id;
                  await onSubmitAsync(newBlock);
                }
                if (blockPhotosOnConfirmAsync !== null) {
                  console.log('blockPhotosOnConfirmAsync running');
                  await blockPhotosOnConfirmAsync(newBlockId);
                }
                setIsVisible(false);
              } catch (err) {
                alert(err);
              }
            }}
          />
        )
      }
      <Button
        title='Cancel'
        color={styles.cancelButton.color}
        onPress={() => {
          setIsVisible(false);
        }}
      />
    </View>
  );
}
