import { router, Stack, useLocalSearchParams } from 'expo-router';
import { SQLiteRunResult, useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState } from 'react';
import { Button, FlatList, KeyboardAvoidingView, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

// Local Imports
import { AddBoreholeParams, Borehole, EditBoreholeParams } from '@/interfaces/Borehole';
import { BoreholeComponent } from '@/components/borehole/BoreholeComponent';
import { AddBoreholeInputForm } from '@/components/borehole/AddBoreholeInputForm';
import { addBoreholeDb } from '@/db/borehole/addBoreholeDb';
import { editBoreholeDb } from '@/db/borehole/editBoreholeDb';

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

  const addBorehole = async (addBoreholeParams: AddBoreholeParams) => {
    try {
      const borehole: Borehole = await addBoreholeDb(db, projectId, addBoreholeParams);
      setBoreholes((prevBoreholes: Borehole[]) => [...prevBoreholes, borehole]);
    } catch (err) {
      const errMsg = `Error: ${err}`;
      alert(errMsg);
      console.log(errMsg);
    }
  };

  const deleteBorehole = async (boreholeId: number) => {
    try {
      await db.runAsync('DELETE FROM boreholes WHERE id = ?', boreholeId);
      setBoreholes((prevBoreholes: Borehole[]) => prevBoreholes.filter((bh: Borehole) => bh.id !== boreholeId));
    } catch (err) {
      const errMsg = `Error: ${err}`;
      alert(errMsg);
      console.log(errMsg);
    }
  };

  const editBorehole = async (editBoreholeParams: EditBoreholeParams) => {
    try {
      const result: SQLiteRunResult = await editBoreholeDb(db, editBoreholeParams);
      setBoreholes((prevBoreholes: Borehole[]) =>
        prevBoreholes.map((bh: Borehole) =>
          (bh.id === editBoreholeParams.id)
          ? { 
            ...bh, 
            ...editBoreholeParams 
          } 
          : bh
        )
      );
    } catch (err) {
      const errMsg = `Error: ${err}`;
      alert(errMsg);
      console.log(errMsg);
    }
  };

  const fetchAllBoreholes = async () => {
    const rawBoreholes = await db.getAllAsync(`SELECT * FROM boreholes WHERE projectId = ?;`, [projectId]);
    const boreholes: Borehole[] = rawBoreholes.map((row: any) => ({
      id: row.id,
      projectId: projectId,
      name: row.name,
      typeOfBoring: row.typeOfBoring,
      diameterOfBoring: row.diameterOfBoring,
      eastingInMetres: row.eastingInMetres,
      northingInMetres: row.northingInMetres,
      reducedLevelInMetres: row.reducedLevelInMetres,
    }));
    setBoreholes(boreholes);
    const test = await db.getAllAsync(`SELECT * FROM boreholes;`);
    console.log(test);
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
        renderItem={({ item }) => <BoreholeComponent projectName={projectName} borehole={item} editBorehole={editBorehole} deleteBorehole={deleteBorehole} />}
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
        isAddButtonPressed && <AddBoreholeInputForm addBorehole={addBorehole} setIsAddButtonPressed={setIsAddButtonPressed} />
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