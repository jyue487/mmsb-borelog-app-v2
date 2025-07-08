import { Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Button, FlatList, Keyboard, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";

// Local Imports
import { CORING_BLOCK_TYPE_ID, SPT_BLOCK_TYPE_ID } from '@/constants/BlockTypeId';
import { SptBlockComponent } from '@/components/SptBlock';
import { CoringBlockComponent } from '@/components/CoringBlock';
import { Block } from '@/types/Block';
import { SptBlockDetailsInputForm } from '@/components/blockDetailsInputForms/SptBlockDetailsInputForm';
import { CoringBlockDetailsInputForm } from '@/components/blockDetailsInputForms/CoringBlockDetailsInputForm';

export default function BoreholeScreen() {
	const { id, project_name, name } = useLocalSearchParams();
  if (typeof id != 'string' || typeof project_name != 'string' || typeof name != 'string') {
    throw new Error(`Error. id: ${id}, project_name: ${project_name}, name: ${name}`);
  }
  const borehole_id: number = parseInt(id, 10);
  const borehole_name: string = name;
  const [isAddNewBlockButtonPressed, setIsAddNewBlockButtonPressed] = useState<boolean>(false);
  const [isSelectOperationTypePressed, setIsSelectOperationTypePressed] = useState<boolean>(false);
  const [newBlock, setNewBlock] = useState<Block>();
  const [operationType, setOperationType] = useState<string>('Select Operation Type');
  const [data, setData] = useState<Block[]>([
    {
      id: 1, 
      block_type_id: SPT_BLOCK_TYPE_ID,
      block_type: 'Spt',
      borehole_id: borehole_id, 
      block_id: 1,
      topDepthInMetres: 75,
      baseDepthInMetres: 75.09,
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
    },
    {
      id: 2, 
      block_type_id: SPT_BLOCK_TYPE_ID, 
      block_type: 'Spt',
      borehole_id: borehole_id, 
      block_id: 2,
      topDepthInMetres: 76.5,
      baseDepthInMetres: 76.6,
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
    },
    {
      id: 3,
      block_type_id: CORING_BLOCK_TYPE_ID, 
      block_type: 'Coring',
      borehole_id: borehole_id, 
      block_id: 3,
      topDepthInMetres: 78,
      baseDepthInMetres: 79.5,
      rockDescription: 'Light grey, medium grey slightly fractured to fresh good LIMESTONE',
      coreRun: 1.5,
      coreRecovery: 100,
      rqd: 84,
    }
  ]);


  const addNewBlock = (newBlock: Block) => {
    setData(prev => [...prev, newBlock]);
  };

  const clearData = async () => {
    setData([]);
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
                    data={['SPT', 'Coring']}
                    keyExtractor={item => item}
                    renderItem={({ item }) => (
                      <TouchableOpacity 
                        onPress={() => {
                          setOperationType(item)
                          setIsSelectOperationTypePressed(false)
                          switch (item) {
                            case 'SPT':
                              console.log('SPT pressed!');
                              break;
                            case 'Coring':
                              console.log('Coring pressed!');
                              break;
                            default:
                              throw new Error('Unknown block type');
                          }
                        }}
                        style={{  
                          alignItems: 'center',
                          borderLeftWidth: 0.5,
                          borderRightWidth: 0.5,
                          borderBottomWidth: 0.5,
                          padding: 10,
                        }}>
                        <Text>{item}</Text>
                      </TouchableOpacity>
                    )}
                  />
                )
              }
              { 
                operationType === 'SPT' && (
                  <SptBlockDetailsInputForm 
                    borehole_id={borehole_id}
                    addNewBlock={addNewBlock}
                    setIsAddNewBlockButtonPressed={setIsAddNewBlockButtonPressed}
                  />
                )
              }
              { 
                operationType === 'Coring' && (
                  <CoringBlockDetailsInputForm 
                    borehole_id={borehole_id}
                    addNewBlock={addNewBlock}
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
          title: `${project_name.toUpperCase()} / ${borehole_name.toUpperCase()}`,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      />
      <FlatList
        data={data}
        keyExtractor={(block: Block) => block.id.toString()}
        renderItem={({ item }) => {
          switch (item.block_type) {
          case 'Spt':
            return <SptBlockComponent style={styles.block} sptBlock={item}/>;
          case 'Ud':
            return (
              <View style={styles.block}>
                <Text>Block {item.id}</Text>
              </View>
            );
          case 'Coring':
            return <CoringBlockComponent style={styles.block} coringBlock={item} />
          default:
            throw new Error('Unknown block type');
          }
        }}
        keyboardShouldPersistTaps="handled"
        ListFooterComponent={renderFooter}
        contentContainerStyle={{ paddingBottom: 500 }}
        style={{ flexGrow: 1, width: '100%',}}
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
  }
});