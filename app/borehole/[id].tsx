import { Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Button, FlatList, KeyboardAvoidingView, Platform, Share, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import * as Print from 'expo-print';

// Local Imports
import { CoringBlockDetailsInputForm } from '@/components/blockDetailsInputForms/CoringBlockDetailsInputForm';
import { SptBlockDetailsInputForm } from '@/components/blockDetailsInputForms/SptBlockDetailsInputForm';
import { CoringBlockComponent } from '@/components/CoringBlockComponent';
import { SptBlockComponent } from '@/components/SptBlockComponent';
import { Block } from '@/types/Block';
import { CavityBlockDetailsInputForm } from '@/components/blockDetailsInputForms/CavityBlockDetailsInputForm';
import { CavityBlockComponent } from '@/components/CavityBlockComponent';
import { UdBlockComponent } from '@/components/UdBlockComponent';
import { UdBlockDetailsInputForm } from '@/components/blockDetailsInputForms/UdBlockDetailsInputForm';
import { MzBlockDetailsInputForm } from '@/components/blockDetailsInputForms/MzBlockDetailsInputForm';
import { PsBlockDetailsInputForm } from '@/components/blockDetailsInputForms/PsBlockDetailsInputForm';
import { MzBlockComponent } from '@/components/MzBlockComponent';
import { PsBlockComponent } from '@/components/PsBlockComponent';
import { generateBorelogPdf } from '@/utils/pdf/generateBorelogPdf';
import { 
  SPT_BLOCK_TYPE_ID,
  CORING_BLOCK_TYPE_ID
} from '@/constants/BlockTypeId';

export default function BoreholeScreen() {
	const { id, projectName, name } = useLocalSearchParams();
  if (typeof id != 'string' || typeof projectName != 'string' || typeof name != 'string') {
    throw new Error(`Error. id: ${id}, projectName: ${projectName}, name: ${name}`);
  }
  const boreholeId: number = parseInt(id, 10);
  const boreholeName: string = name;
  const [isAddNewBlockButtonPressed, setIsAddNewBlockButtonPressed] = useState<boolean>(false);
  const [isSelectOperationTypePressed, setIsSelectOperationTypePressed] = useState<boolean>(false);
  const [operationType, setOperationType] = useState<string>('Select Operation Type');
  const [blocks, setBlocks] = useState<Block[]>([
    {
      id: 1,
      blockId: 1,
      blockTypeId: SPT_BLOCK_TYPE_ID,
      boreholeId: boreholeId,
      blockType: 'Spt',
      sptIndex: 1,
      disturbedSampleIndex: 1,
      topDepthInMetres: 1.5,
      baseDepthInMetres: 1.95,
      soilDescription: 'Loose, light grey SAND',
      seatingIncBlows1: 1,
      seatingIncPen1: 75,
      seatingIncBlows2: 1,
      seatingIncPen2: 75,
      mainIncBlows1: 1,
      mainIncPen1: 75,
      mainIncBlows2: 1,
      mainIncPen2: 75,
      mainIncBlows3: 1,
      mainIncPen3: 75,
      mainIncBlows4: 1,
      mainIncPen4: 75,
      sptNValue: 4,
      recoveryLengthInMillimetres: 400,
    },
    {
      id: 2,
      blockId: 2,
      blockTypeId: SPT_BLOCK_TYPE_ID,
      boreholeId: boreholeId,
      blockType: 'Spt',
      sptIndex: 2,
      disturbedSampleIndex: 2,
      topDepthInMetres: 3,
      baseDepthInMetres: 3.45,
      soilDescription: 'Loose, light grey SAND',
      seatingIncBlows1: 1,
      seatingIncPen1: 75,
      seatingIncBlows2: 1,
      seatingIncPen2: 75,
      mainIncBlows1: 1,
      mainIncPen1: 75,
      mainIncBlows2: 1,
      mainIncPen2: 75,
      mainIncBlows3: 1,
      mainIncPen3: 75,
      mainIncBlows4: 1,
      mainIncPen4: 75,
      sptNValue: 4,
      recoveryLengthInMillimetres: 400,
    },
    {
      id: 3,
      blockId: 3,
      blockTypeId: SPT_BLOCK_TYPE_ID,
      boreholeId: boreholeId,
      blockType: 'Spt',
      sptIndex: 3,
      disturbedSampleIndex: 3,
      topDepthInMetres: 4.5,
      baseDepthInMetres: 4.95,
      soilDescription: 'Loose, light grey SAND',
      seatingIncBlows1: 1,
      seatingIncPen1: 75,
      seatingIncBlows2: 1,
      seatingIncPen2: 75,
      mainIncBlows1: 1,
      mainIncPen1: 75,
      mainIncBlows2: 1,
      mainIncPen2: 75,
      mainIncBlows3: 1,
      mainIncPen3: 75,
      mainIncBlows4: 1,
      mainIncPen4: 75,
      sptNValue: 4,
      recoveryLengthInMillimetres: 400,
    },
    {
      id: 4,
      blockId: 4,
      blockTypeId: SPT_BLOCK_TYPE_ID,
      boreholeId: boreholeId,
      blockType: 'Spt',
      sptIndex: 4,
      disturbedSampleIndex: 4,
      topDepthInMetres: 6,
      baseDepthInMetres: 6.45,
      soilDescription: 'Loose, light grey SAND',
      seatingIncBlows1: 1,
      seatingIncPen1: 75,
      seatingIncBlows2: 1,
      seatingIncPen2: 75,
      mainIncBlows1: 1,
      mainIncPen1: 75,
      mainIncBlows2: 1,
      mainIncPen2: 75,
      mainIncBlows3: 1,
      mainIncPen3: 75,
      mainIncBlows4: 1,
      mainIncPen4: 75,
      sptNValue: 4,
      recoveryLengthInMillimetres: 400,
    },
    {
      id: 5,
      blockId: 5,
      blockTypeId: SPT_BLOCK_TYPE_ID,
      boreholeId: boreholeId,
      blockType: 'Spt',
      sptIndex: 5,
      disturbedSampleIndex: 5,
      topDepthInMetres: 7.5,
      baseDepthInMetres: 7.95,
      soilDescription: 'Loose, light grey SAND',
      seatingIncBlows1: 1,
      seatingIncPen1: 75,
      seatingIncBlows2: 1,
      seatingIncPen2: 75,
      mainIncBlows1: 1,
      mainIncPen1: 75,
      mainIncBlows2: 1,
      mainIncPen2: 75,
      mainIncBlows3: 1,
      mainIncPen3: 75,
      mainIncBlows4: 1,
      mainIncPen4: 75,
      sptNValue: 4,
      recoveryLengthInMillimetres: 400,
    },
    {
      id: 6,
      blockId: 6,
      blockTypeId: SPT_BLOCK_TYPE_ID,
      boreholeId: boreholeId,
      blockType: 'Spt',
      sptIndex: 6,
      disturbedSampleIndex: 6,
      topDepthInMetres: 9,
      baseDepthInMetres: 9.45,
      soilDescription: 'Loose, light grey SAND',
      seatingIncBlows1: 1,
      seatingIncPen1: 75,
      seatingIncBlows2: 1,
      seatingIncPen2: 75,
      mainIncBlows1: 1,
      mainIncPen1: 75,
      mainIncBlows2: 1,
      mainIncPen2: 75,
      mainIncBlows3: 1,
      mainIncPen3: 75,
      mainIncBlows4: 1,
      mainIncPen4: 75,
      sptNValue: 4,
      recoveryLengthInMillimetres: 400,
    },
    // {
    //   id: 7,
    //   blockId: 7,
    //   blockTypeId: CORING_BLOCK_TYPE_ID,
    //   boreholeId: boreholeId,
    //   blockType: 'Coring',
    //   rockSampleIndex: 1,
    //   topDepthInMetres: 17,
    //   baseDepthInMetres: 18.5,
    //   rockDescription: 'Moderately strong, light brownish grey silty SAND with some gravel',
    //   coreRunInMetres: 1.5,
    //   coreRecoveryInPercentage: 93.3,
    //   rqdInPercentage: 40,
    // }
  ]);

  const clearData = async () => {
    setBlocks([]);
  };

  const renderFooter = () => (
    <>
      {
        !isAddNewBlockButtonPressed && (
          <Button
            title='Add new block'
            onPress={() => {
              setOperationType('Select Operation Type');
              setIsAddNewBlockButtonPressed(true);
            }}
          />
        )
      }
      {
        isAddNewBlockButtonPressed && (
          <View style={[styles.block, { padding: 20, gap: 20 }]}>
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
                    data={['SPT', 'Coring', 'Cavity', 'UD', 'MZ', 'PS']}
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
              { 
                operationType === 'SPT' && (
                  <SptBlockDetailsInputForm 
                    boreholeId={boreholeId}
                    blocks={blocks}
                    setBlocks={setBlocks}
                    setIsAddNewBlockButtonPressed={setIsAddNewBlockButtonPressed}
                  />
                )
              }
              { 
                operationType === 'Coring' && (
                  <CoringBlockDetailsInputForm 
                    boreholeId={boreholeId}
                    blocks={blocks}
                    setBlocks={setBlocks}
                    setIsAddNewBlockButtonPressed={setIsAddNewBlockButtonPressed}
                  /> 
                )
              }
              { 
                operationType === 'Cavity' && (
                  <CavityBlockDetailsInputForm 
                    boreholeId={boreholeId}
                    blocks={blocks}
                    setBlocks={setBlocks}
                    setIsAddNewBlockButtonPressed={setIsAddNewBlockButtonPressed}
                  /> 
                )
              }
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
            <Button
              title='Cancel'
              onPress={() => {
                setIsSelectOperationTypePressed(false);
                setIsAddNewBlockButtonPressed(false);
              }}
            />
          </View>
        )
      }
      <Button
        title='Clear Data'
        onPress={() => clearData()}
      />
      <Button
        title='Share'
        onPress={async () => {
          const html = await generateBorelogPdf(blocks);
          const { uri } = await Print.printToFileAsync({
            html,
            base64: false,
          });

          const newFileUri = FileSystem.documentDirectory + `${projectName.toUpperCase()}-${boreholeName.toUpperCase()}.pdf`;
          await FileSystem.moveAsync({
            from: uri,
            to: newFileUri,
          });

          const isAvailable = await Sharing.isAvailableAsync();
          if (isAvailable) {
            await Sharing.shareAsync(newFileUri);
          } else {
            alert('Sharing is not available on this device');
          }
        }}
      />
    </>
  );



  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}>
      <Stack.Screen
        options={{
          title: `${projectName.toUpperCase()} / ${boreholeName.toUpperCase()}`,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      />
      <FlatList
        data={blocks}
        keyExtractor={(block: Block) => block.id.toString()}
        renderItem={({ item }) => {
          switch (item.blockType) {
          case 'Spt':
            return <SptBlockComponent style={styles.block} sptBlock={item}/>;
          case 'Coring':
            return <CoringBlockComponent style={styles.block} coringBlock={item} />
          case 'Cavity':
            return <CavityBlockComponent style={styles.block} cavityBlock={item} />
          case 'Ud':
            return <UdBlockComponent style={styles.block} udBlock={item} />
          case 'Mz':
            return <MzBlockComponent style={styles.block} mzBlock={item} />
          case 'Ps':
            return <PsBlockComponent style={styles.block} psBlock={item} />
          default:
            throw new Error('Unknown block type');
          }
        }}
        keyboardShouldPersistTaps="handled"
        ListFooterComponent={renderFooter}
        contentContainerStyle={{ paddingBottom: 500 }}
        style={{ width: '100%' }}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  link: {
    paddingTop: 20,
    fontSize: 20,
  },
  block: {
    width: '100%',
    borderWidth: 1,
  },
  listItem: {
		borderLeftWidth: 0.25,
		borderRightWidth: 0.25,
		borderBottomWidth: 0.25,
		alignItems: 'center',
		padding: 10,
	}
});
