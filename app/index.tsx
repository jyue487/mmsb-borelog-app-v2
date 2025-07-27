import { Stack } from 'expo-router';
import * as SQLite from 'expo-sqlite';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState } from 'react';
import { Button, FlatList, KeyboardAvoidingView, StyleSheet } from "react-native";

// Local imports
import { AddProjectInputForm } from '@/components/project/AddProjectInputForm';
import { ProjectComponent } from '@/components/project/ProjectComponent';
import { Project } from '@/interfaces/Project';

export default function ProjectListScreen() {
  const db = useSQLiteContext()
  // const db = SQLite.openDatabaseSync('mmsb.db');
  const [isAddButtonPressed, setIsAddButtonPressed] = useState<boolean>(false);
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    const initDb = async () => {
      await fetchAllProjects();
    };
    initDb();
  }, []);

  // TODO: How to make it safe from SQL injections?
  const addProject = async (newProjectName: string) => {
    const result: SQLite.SQLiteRunResult = await db.runAsync('INSERT INTO projects (name) VALUES (?)', newProjectName);
    setProjects((prevProjects: Project[]) => [...prevProjects, { id: result.lastInsertRowId, name: newProjectName }]);
  };

  const deleteProject = async (projectId: number) => {
    await db.runAsync('DELETE FROM projects WHERE id = ?', projectId);
    setProjects((prevProjects: Project[]) => prevProjects.filter((p: Project) => p.id !== projectId));
  };

  const editProject = async (projectId: number, newProjectName: string) => {
    await db.runAsync('UPDATE projects SET name = ? WHERE id = ?', newProjectName, projectId);
    setProjects((prevProjects: Project[]) =>
      prevProjects.map((p: Project) =>
        (p.id === projectId) ? { ...p, name: newProjectName } : p
      )
    );
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
        renderItem={({ item }) => <ProjectComponent project={item} editProject={editProject} />}
        style={{ flexGrow: 0, width: '100%' }}
      />
      {
        !isAddButtonPressed && (
          <Button
            title='Add Project'
            onPress={() => {
              setIsAddButtonPressed(true);
            }}
          />
        )
      }
      {
        isAddButtonPressed && (
          <AddProjectInputForm 
            addProject={addProject}
            setIsAddButtonPressed={setIsAddButtonPressed}
          />
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
  projectButton: {
    padding: 20,
    fontSize: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    height: 100
  },
});