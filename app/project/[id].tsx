import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState } from 'react';
import { Button, FlatList, KeyboardAvoidingView, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

// Local Imports
import { Borehole } from '@/interfaces/Borehole';
import { BoreholeComponent } from '@/components/borehole/BoreholeComponent';
import { AddBoreholeInputForm } from '@/components/borehole/AddBoreholeInputForm';

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

  useEffect(() => {
    const initDb = async () => {
      await fetchAllBoreholes();
    };
    initDb();
  }, []);

  const addBorehole = async (projectId: number, newBoreholeName: string) => {
    const result = await db.runAsync('INSERT INTO boreholes (projectId, name) VALUES (?, ?)', [projectId, newBoreholeName]);
    setBoreholes((prevBoreholes: Borehole[]) => [...prevBoreholes, { id: result.lastInsertRowId, projectId: projectId, name: newBoreholeName }]);
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
          title: (projectName.length < 10) ? projectName : `${projectName.slice(0, 10)}...`,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      />
      <FlatList
        data={boreholes}
        keyExtractor={(borehole: Borehole) => borehole.id.toString()}
        renderItem={({ item }) => <BoreholeComponent projectName={projectName} borehole={item} />}
        style={{ flexGrow: 0, width: '100%' }}
      />
      {
        !isAddButtonPressed && (
          <Button
            title='Add new Borehole'
            onPress={() => {
              setIsAddButtonPressed(true);
            }}
          />
        )
      }
      {
        isAddButtonPressed && <AddBoreholeInputForm projectId={projectId} addBorehole={addBorehole} setIsAddButtonPressed={setIsAddButtonPressed} />
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
});