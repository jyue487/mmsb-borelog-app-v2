import { Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Button, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

// Local Imports
import { SPT_BLOCK_TYPE_ID } from '@/constants/BlockTypeId';
import { SptBlockComponent } from '@/components/SptBlock';
import { Block } from '@/types/Block';

export default function BoreholeScreen() {
	const { id, project_name, name } = useLocalSearchParams();
  if (typeof id != 'string' || typeof project_name != 'string' || typeof name != 'string') {
    throw new Error(`Error. id: ${id}, project_name: ${project_name}, name: ${name}`);
  }
  const borehole_id: number = parseInt(id, 10);
  const borehole_name: string = name;
  const [isAddNewBlockButtonPressed, setIsAddNewBlockButtonPressed] = useState<boolean>(false);
  const [isSelectOperationTypePressed, setIsSelectOperationTypePressed] = useState<boolean>(false);
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
      seatingIncBlows2: 2,
      mainIncBlows1: 2,
      mainIncBlows2: 4,
      mainIncBlows3: 4,
      mainIncBlows4: 4,
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
      seatingIncBlows2: 3,
      mainIncBlows1: 5,
      mainIncBlows2: 5,
      mainIncBlows3: 5,
      mainIncBlows4: 6,
    },
  ]);



  const addNewBlock = async (name: string) => {
    const id = data[data.length - 1] ? data[data.length - 1].id + 1 : 1
    const newBlock: Block = { 
      id: id, 
      block_type_id: SPT_BLOCK_TYPE_ID, 
      block_type: 'Spt',
      borehole_id: borehole_id,
      block_id: id,
      topDepthInMetres: 1.5,
      baseDepthInMetres: 1.95,
      soilDescription: 'Loose, light yellowish, grey silty SAND with traces of decayed wood',
      seatingIncBlows1: 1,
      seatingIncBlows2: 2,
      mainIncBlows1: 2,
      mainIncBlows2: 4,
      mainIncBlows3: 4,
      mainIncBlows4: 6,
    };
    setData(prev => [...prev, newBlock]);
  };

  const clearData = async () => {
    setData([]);
  };

  return (
    <View style={styles.container}>
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
          default:
            throw new Error('Unknown block type');
          }
        }}
        style={{ flexGrow: 0, width: '100%',}}
      />
      {
        !isAddNewBlockButtonPressed && (
          <Button
            title='Add new block'
            onPress={() => setIsAddNewBlockButtonPressed(true)}
          />
        )
      }
      {
        isAddNewBlockButtonPressed && (
          <View style={[styles.block, { padding: 20, gap: 20 }]}>
            <View>
              <TouchableOpacity 
                onPress={() => setIsSelectOperationTypePressed(!isSelectOperationTypePressed)}
                style={{ 
                  borderWidth: 0.5, 
                  alignItems: 'center',
                  padding: 5,
                }}>
                <Text>{operationType}</Text>
              </TouchableOpacity>
              {
                isSelectOperationTypePressed && (
                  <FlatList
                    data={['SPT', 'UD']}
                    renderItem={({ item }) => (
                      <TouchableOpacity 
                        onPress={() => {
                          setOperationType(item)
                          setIsSelectOperationTypePressed(false)
                          switch (item) {
                            case 'SPT':
                              console.log('SPT pressed!');
                              return;
                            case 'UD':
                              console.log('UD pressed!');
                              return;
                            default:
                              throw new Error('Unknown block type');
                          }
                        }}
                        style={{  
                          alignItems: 'center',
                          borderLeftWidth: 0.5,
                          borderRightWidth: 0.5,
                          borderBottomWidth: 0.5,
                          padding: 5,
                        }}>
                        <Text>{item}</Text>
                      </TouchableOpacity>
                    )}
                  />
                )
              }
            </View>
            <Button
              title='Confirm'
              onPress={() => {
                addNewBlock('dummy_name')
                setIsAddNewBlockButtonPressed(false);
              }}
            />
            <Button
              title='Cancel'
              onPress={() => {
                setOperationType('Select Operation Type');
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
    </View>
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