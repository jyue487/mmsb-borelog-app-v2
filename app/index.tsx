import { Stack } from 'expo-router';
import { SQLiteRunResult } from 'expo-sqlite';
import { useEffect, useState } from 'react';
import { Button, FlatList, KeyboardAvoidingView, StyleSheet, View } from "react-native";

// Local imports
import { AddProjectInputForm } from '@/components/project/AddProjectInputForm';
import { ProjectComponent } from '@/components/project/ProjectComponent';
import { addProjectDbAsync } from '@/db/project/addProjectDbAsync';
import { editProjectDbAsync } from '@/db/project/editProjectDbAsync';
import { AddProjectParams, EditProjectParams, Project } from '@/interfaces/Project';
import { db } from '@/db/db';

export default function ProjectListScreen() {
  // const db = SQLite.openDatabaseSync('mmsb.db');
  const [isAddButtonPressed, setIsAddButtonPressed] = useState<boolean>(false);
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    const init = async () => {
      await fetchAllProjects();
    };
    init();
  }, []);

  // TODO: How to make it safe from SQL injections?
  const addProject = async (addProjectParams: AddProjectParams) => {
    try {
      const project: Project = await addProjectDbAsync(db, addProjectParams);
      setProjects((prevProjects: Project[]) => [...prevProjects, project]);
    } catch (err) {
      const errMsg = `Error: Duplicate project code/title. ${err}`;
      alert(errMsg);
      console.log(errMsg);
    }
  };

  const deleteProject = async (projectId: number) => {
    try {
      await db.runAsync('DELETE FROM projects WHERE id = ?', projectId);
      setProjects((prevProjects: Project[]) => prevProjects.filter((p: Project) => p.id !== projectId));
    } catch (err) {
      const errMsg = `Error: Duplicate title ${err}`;
      alert(errMsg);
      console.log(errMsg);
    }
  };

  const editProject = async (editProjectParams: EditProjectParams) => {
    try {
      const result: SQLiteRunResult = await editProjectDbAsync(db, editProjectParams);
      setProjects((prevProjects: Project[]) =>
        prevProjects.map((p: Project) =>
          (p.id === editProjectParams.id)
          ? { 
            ...p,
            ...editProjectParams
          } 
          : p
        )
      );
    } catch (err) {
      const errMsg = `Error: Duplicate title ${err}`;
      alert(errMsg);
      console.log(errMsg);
    }
  };

  // `getAllAsync()` is useful when you want to get all results as an array of objects.
  const fetchAllProjects = async () => {
    const rawProjects = await db.getAllAsync('SELECT * FROM projects');
    const projects: Project[] = rawProjects.map((row: any) => ({
      id: row.id,
      code: row.code,
      title: row.title,
      location: row.location,
      client: row.client,
      consultant: row.consultant,
    }));
    setProjects(projects);
  };

  const clearTable = async () => {
    await db.runAsync(`DELETE FROM projects;`);
    await fetchAllProjects();
  };

  const clearDatabase = async () => {
    await db.runAsync('DROP TABLE projects');
  };

  const renderFooter = () => {
    return (
      <View style={{ gap: 20 }}>
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
      {/* <Button
        title='Clear Table'
        onPress={clearTable}
      /> */}
      {/* <Button
        title='Clear Database'
        onPress={clearDatabase}
      /> */}
      </View>
    );
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
        renderItem={({ item }) => <ProjectComponent project={item} editProject={editProject} deleteProject={deleteProject} />}
        keyboardShouldPersistTaps="handled"
        ListFooterComponent={renderFooter()}
        contentContainerStyle={{ paddingBottom: 500 }}
        style={{ flexGrow: 0, width: '100%' }}
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