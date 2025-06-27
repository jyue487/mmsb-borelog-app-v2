import { Link, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Button, View, Text, TextInput, StyleSheet, Pressable, FlatList } from "react-native";
import { BlurView } from 'expo-blur';

// Local Imports
import { Block } from '../../types/Block';
import { useSafeAreaFrame } from 'react-native-safe-area-context';

export default function ProjectScreen() {
	const { id } = useLocalSearchParams();
  const [isPressed, setIsPressed] = useState<boolean>(false);
  const [data, setData] = useState<Block[]>([
    {id: 1, name: 'Spt', sptName: 'SptName'},
    {id: 2, name: 'SPT', sptName: 'SptName'},
    {id: 3, name: 'UD', udName: 'udName'},
  ]);
  const [text, setText] = useState<string>('')



  const addNewBlock = async (name: string, udName: string) => {
    const newBlock: Block = { id: data[data.length - 1] ? data[data.length - 1].id + 1 : 1, name: name, udName: udName};
    setData(prev => [...prev, newBlock]);
  };

  const clearData = async () => {
    setData([]);
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Project ' + id,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      />
      <Button
        title='Clear Data'
        onPress={() => clearData()}
      />
      <FlatList
        data={data}
        keyExtractor={(block) => block.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.block}>
            <Text>{item.name} Block</Text>
          </View>
        )}
        style={{ flexGrow: 0, width: '100%',}}
      />
      {
        !isPressed && (
          <Button
            title='Add new block'
            onPress={() => setIsPressed(true)}
          />
        )
      }
      {
        isPressed && (
          <View style={styles.block}>
            <TextInput
              style={{
                height: 40,
                width: 100,
                borderColor: 'gray',
                borderWidth: 1,
              }}
              placeholder='Block name'
              value={text}
              onChangeText={setText}
            />
            <Button
              title='Confirm'
              onPress={() => {
                addNewBlock(text, 'ud' + text)
                setIsPressed(false);
              }}
            />
            <Button
              title='Cancel'
              onPress={() => setIsPressed(false)}
            />
          </View>
        )
      }
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
    justifyContent: 'center',
    alignItems: 'center',
    height: 150,
    width: '100%',
    borderWidth: 1,
  }
});