import { Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Button, FlatList, KeyboardAvoidingView, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";

// Local Imports
import { CoringBlockDetailsInputForm } from '@/components/blockDetailsInputForms/CoringBlockDetailsInputForm';
import { SptBlockDetailsInputForm } from '@/components/blockDetailsInputForms/SptBlockDetailsInputForm';
import { CoringBlockComponent } from '@/components/CoringBlockComponent';
import { SptBlockComponent } from '@/components/SptBlockComponent';
import { CORING_BLOCK_TYPE_ID, SPT_BLOCK_TYPE_ID } from '@/constants/BlockTypeId';
import { Block } from '@/types/Block';
import { CavityBlockDetailsInputForm } from '@/components/blockDetailsInputForms/CavityBlockDetailsInputForm';
import { CavityBlockComponent } from '@/components/CavityBlockComponent';
import { UdBlockComponent } from '@/components/UdBlockComponent';
import { UdBlockDetailsInputForm } from '@/components/blockDetailsInputForms/UdBlockDetailsInputForm';

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
      blockTypeId: SPT_BLOCK_TYPE_ID,
      blockType: 'Spt',
      boreholeId: boreholeId, 
      sptIndex: 1,
      disturbedSampleIndex: 1,
      blockId: 1,
      topDepthInMetres: 75,
      baseDepthInMetres: 75.45,
      soilDescription: 'Loose, light yellowish, grey silty SAND with traces of decayed wood',
      seatingIncBlows1: 1,
      seatingIncPen1: 75,
      seatingIncBlows2: 2,
      seatingIncPen2: 75,
      mainIncBlows1: 2,
      mainIncPen1: 75,
      mainIncBlows2: 4,
      mainIncPen2: 75,
      mainIncBlows3: 4,
      mainIncPen3: 75,
      mainIncBlows4: 4,
      mainIncPen4: 75,
      sptNValue: 14,
      recoveryLengthInMillimetres: 430,
    },
    {
      id: 2, 
      blockTypeId: SPT_BLOCK_TYPE_ID, 
      blockType: 'Spt',
      boreholeId: boreholeId, 
      sptIndex: 2,
      disturbedSampleIndex: 2,
      blockId: 2,
      topDepthInMetres: 76.5,
      baseDepthInMetres: 76.95,
      soilDescription: 'Loose, grey silty GRAVEL',
      seatingIncBlows1: 2,
      seatingIncPen1: 75,
      seatingIncBlows2: 3,
      seatingIncPen2: 75,
      mainIncBlows1: 5,
      mainIncPen1: 75,
      mainIncBlows2: 5,
      mainIncPen2: 75,
      mainIncBlows3: 5,
      mainIncPen3: 75,
      mainIncBlows4: 6,
      mainIncPen4: 75,
      sptNValue: 21,
      recoveryLengthInMillimetres: 450,
    },
    {
      id: 3,
      blockTypeId: CORING_BLOCK_TYPE_ID, 
      blockType: 'Coring',
      boreholeId: boreholeId, 
      blockId: 3,
      rockSampleIndex: 1,
      topDepthInMetres: 78,
      baseDepthInMetres: 79.5,
      rockDescription: 'Light grey, medium grey slightly fractured to fresh good LIMESTONE',
      coreRunInMetres: 1.5,
      coreRecoveryInPercentage: 100,
      rqdInPercentage: 84,
    }
  ]);


  const addNewBlock = (newBlock: Block) => {
    newBlock.id = blocks.length + 1;
    setBlocks(prev => [...prev, newBlock]);
  };

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
                    data={['SPT', 'Coring', 'Cavity', 'UD']}
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
