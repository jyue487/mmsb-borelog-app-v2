import { useSQLiteContext } from 'expo-sqlite';
import { Link, Stack, useLocalSearchParams, router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Button, KeyboardAvoidingView, View, Text, TextInput, StyleSheet, Pressable, FlatList } from "react-native";

// Local Imports
import { Borehole } from '@/types/Borehole';

export default function ProjectScreen() {
  const db = useSQLiteContext()
  const { id, name } = useLocalSearchParams();
  if (typeof id != 'string' || typeof name != 'string') {
    throw new Error(`Error. id: ${id}`);
  }
  const projectId: number = parseInt(id, 10);
  const projectName: string = name;
  const [isAddButtonPressed, setIsAddButtonPressed] = useState<boolean>(false);
  const [boreholes, setBoreholes] = useState<Borehole[]>([]);
  const [newBoreholeName, setNewBoreholeName] = useState<string>('')

  useEffect(() => {
    const initDb = async () => {
      await db.execAsync(
        `
        PRAGMA foreign_keys = ON;
        PRAGMA journal_mode = WAL;
        CREATE TABLE IF NOT EXISTS boreholes (
          id INTEGER PRIMARY KEY,
          projectId INTEGER,
          name TEXT NOT NULL,
          FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE
        );
        `
      );
      await fetchAllBoreholes();
    };
    initDb();
  }, []);

  const addNewBorehole = async () => {
    const res = await db.runAsync('INSERT INTO boreholes (projectId, name) VALUES (?, ?)', [projectId, newBoreholeName]);
    console.log(res.lastInsertRowId);
    await fetchAllBoreholes();
  };

  const fetchAllBoreholes = async () => {
    const rawBoreholes = await db.getAllAsync(`SELECT * FROM boreholes WHERE projectId = ?;`, [projectId]);
    const boreholes: Borehole[] = rawBoreholes.map((row: any) => ({
      id: row.id,
      projectId: projectId,
      name: row.name
    }));
    setBoreholes(boreholes);
  };

  const clearTable = async () => {
    await db.runAsync(`DELETE FROM boreholes WHERE projectId = ?;`, [projectId]);
    await fetchAllBoreholes();
  };

  const dropTable = async () => {
    await db.runAsync(`DROP TABLE boreholes;`);
  };

  return (
    <KeyboardAvoidingView behavior='height' style={styles.container}>
      <Stack.Screen
        options={{
          title: `${projectName.toUpperCase()}`,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      />
      <FlatList
        data={boreholes}
        keyExtractor={(borehole: Borehole) => borehole.id.toString()}
        renderItem={({ item }) => (
          <Pressable
            onPress={() =>
              router.navigate({
                pathname: '../borehole/[id]',
                params: { 
                  id: item.id, 
                  projectName: projectName, 
                  name: item.name 
                },
              })
            }
            style={({ pressed }) => [
              {
                backgroundColor: pressed ? 'rgb(222, 246, 255)' : 'rgb(255, 255, 255)',
              },
              styles.boreholeButton
            ]}>
            <Text>{item.name.toUpperCase()}</Text>
          </Pressable>
        )}
        style={{ flexGrow: 0, width: '100%' }}
      />
      {
        !isAddButtonPressed && (
          <Button
            title='Add new Borehole'
            onPress={() => {
              setNewBoreholeName('');
              setIsAddButtonPressed(true);
            }}
          />
        )
      }
      {
        isAddButtonPressed && (
          <View style={styles.borehole}>
            <TextInput
              style={{
                height: 40,
                width: 100,
                borderColor: 'gray',
                borderWidth: 1,
              }}
              placeholder='Borehole name'
              value={newBoreholeName}
              onChangeText={setNewBoreholeName}
            />
            <Button
              title='Confirm'
              onPress={() => {
                addNewBorehole()
                setIsAddButtonPressed(false);
              }}
            />
            <Button
              title='Cancel'
              onPress={() => setIsAddButtonPressed(false)}
            />
          </View>
        )
      }
      <Button
        title='Clear Table'
        onPress={() => clearTable()}
      />
      <Button
        title='Drop Table'
        onPress={() => dropTable()}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    margin: 20,
  },
  borehole: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 150,
    width: '100%',
    borderWidth: 1,
  },
  boreholeButton: {
    padding: 20,
    fontSize: 20,
    // backgroundColor: 'red',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    height: 100
  },
});