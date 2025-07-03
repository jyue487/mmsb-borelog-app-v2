import { useEffect, useState } from 'react';
import { Link, Stack, router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { Button, KeyboardAvoidingView, View, Text, TextInput, FlatList, Pressable, StyleSheet } from "react-native";
import * as SQLite from 'expo-sqlite';

// Local imports
import { Project } from '@/types/Project';

export default function ProjectListScreen() {
  const db = useSQLiteContext()
  // const db = SQLite.openDatabaseSync('mmsb.db');
  const [isAddButtonPressed, setIsAddButtonPressed] = useState<boolean>(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [newProjectName, setNewProjectName] = useState<string>('')

  useEffect(() => {
    const initDb = async () => {
      await db.execAsync(
        `
        PRAGMA journal_mode = WAL;
        CREATE TABLE IF NOT EXISTS projects (
          id INTEGER PRIMARY KEY, 
          name TEXT NOT NULL
        );
        `
      );
      await fetchAllProjects();
    };
    initDb();
  }, []);

  // TODO: How to make it safe from SQL injections?
  const addNewProject = async () => {
    await db.runAsync('INSERT INTO projects (name) VALUES (?)', newProjectName);
    await fetchAllProjects();
  };

  // `getAllAsync()` is useful when you want to get all results as an array of objects.
  const fetchAllProjects = async () => {
    const rawProjects = await db.getAllAsync('SELECT * FROM projects');
    const projects: Project[] = rawProjects.map((row: any) => ({
      id: row.id,
      name: row.name
    }));
    setProjects(projects);
  };

  const clearTable = async () => {
    await db.runAsync(`DELETE FROM projects;`);
    await fetchAllProjects();
  };

  const clearDatabase = async () => {
    await db.runAsync('DROP TABLE projects');
    await SQLite.deleteDatabaseAsync('test.db');
  };

  return (
    <KeyboardAvoidingView behavior='height' style={styles.container}>
      <Stack.Screen
        options={{
          title: 'MMSB Project List',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      />
      <FlatList
        data={projects}
        keyExtractor={(project: Project) => project.id.toString()}
        renderItem={({ item }) => (
          <Pressable
            onPress={() =>
              router.navigate({
                pathname: '/project/[id]',
                params: { 
                  id: item.id,
                  name: item.name
                },
              })
            }
            style={({ pressed }) => [
              {
                backgroundColor: pressed ? 'rgb(222, 246, 255)' : 'rgb(255, 255, 255)',
              },
              styles.projectButton
            ]}>
            <Text>PROJECT {item.id}: {item.name.toUpperCase()}</Text>
          </Pressable>
        )}
        style={{ flexGrow: 0, width: '100%' }}
      />
      {
        !isAddButtonPressed && (
          <Button
            title='Add Project'
            onPress={() => setIsAddButtonPressed(true)}
          />
        )
      }
      {
        isAddButtonPressed && (
          <View style={styles.project}>
            <TextInput
              style={{
                height: 40,
                width: 100,
                borderColor: 'gray',
                borderWidth: 1,
              }}
              placeholder='Project name'
              value={newProjectName}
              onChangeText={setNewProjectName}
            />
            <Button
              title='Confirm'
              onPress={() => {
                addNewProject()
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
        onPress={clearTable}
      />
      <Button
        title='Clear Database'
        onPress={clearDatabase}
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
  project: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 150,
    width: '100%',
    borderWidth: 1,
  },
  projectButton: {
    padding: 20,
    fontSize: 20,
    // backgroundColor: 'red',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    height: 100
  },
});