import MaterialIcons from "@react-native-vector-icons/material-icons/static";
import { Stack, router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Button, FlatList, KeyboardAvoidingView, StyleSheet, TouchableOpacity, View } from "react-native";

// Local imports
import { AddProjectInputForm } from '@/components/project/AddProjectInputForm';
import { ProjectComponent } from '@/components/project/ProjectComponent';
import { addProjectDbAsync } from '@/db/project/addProjectDbAsync';
import { editProjectDbAsync } from '@/db/project/editProjectDbAsync';
import { AddProjectParams, EditProjectParams, Project } from '@/interfaces/Project';
// import { db } from '@/db/db';
import { useAuth } from '@/context/AuthContextProvider';
import { supabase } from '@/db/supabase';
import { powersync, setupPowerSync } from '@/powersync/system';
import LoadingScreen from './loading';
import CameraComponent from "./camera";

export default function ProjectListScreen() {
  const { isSignIn } = useAuth();
  const [isPowersyncReady, setIsPowersyncReady] = useState<boolean>(false);
  const [isAddButtonPressed, setIsAddButtonPressed] = useState<boolean>(false);
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    const init = async () => {
      await setupPowerSync();
      if (isSignIn) {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          console.log('Error: Sign in but no session');
          throw new Error('Error: Sign in but no session');
        }
        await powersync.waitForFirstSync();
        setIsPowersyncReady(true);
      }
      await fetchAllProjects();
    };

    init();
  }, [isPowersyncReady]);

  // TODO: How to make it safe from SQL injections?
  const addProject = async (addProjectParams: AddProjectParams) => {
    try {
      const project: Project = await addProjectDbAsync(powersync, addProjectParams);
      setProjects((prevProjects: Project[]) => [...prevProjects, project]);
    } catch (err) {
      const errMsg = `Error: ${err}`;
      alert(errMsg);
      console.log(errMsg);
    }
  };

  const deleteProject = async (projectId: string) => {
    try {
      console.log(`[deleteProject] powersync connected: ${powersync.connected}`);
      await powersync.execute(`DELETE FROM projects WHERE id = ?`, [projectId]);
      setProjects((prevProjects: Project[]) => prevProjects.filter((p: Project) => p.id !== projectId));
    } catch (err) {
      const errMsg = `Error: ${err}`;
      alert(errMsg);
      console.log(errMsg);
    }
  };

  const editProject = async (editProjectParams: EditProjectParams) => {
    try {
      await editProjectDbAsync(powersync, editProjectParams);
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
      const errMsg = `Error: ${err}`;
      alert(errMsg);
      console.log(errMsg);
    }
  };

  // `getAllAsync()` is useful when you want to get all results as an array of objects.
  const fetchAllProjects = async () => {
    console.log(`fetchAllProjects called, powersync.connected ${powersync.connected}`);
    const rawProjects = await powersync.getAll('SELECT * FROM projects');
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
      </View>
    );
  };

  if (isSignIn && !isPowersyncReady) {
    console.log("Signed in but powersync is not ready");
    return <LoadingScreen displayText="Signing In" />;
  }

  // return <CameraComponent />;

  return (
    <KeyboardAvoidingView behavior='height' style={styles.container}>
      <Stack.Screen
        options={{
          title: 'MMSB Project List',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          headerRight: () => (
            <TouchableOpacity onPress={() => router.push('/settings/SettingsScreen')}>
              <MaterialIcons name="settings" size={30} color="gray" />
            </TouchableOpacity>
          ),
        }}
      />
      <FlatList
        data={projects}
        keyExtractor={(project: Project) => project.id.toString()}
        renderItem={({ item }) => <ProjectComponent project={item} editProject={editProject} deleteProject={deleteProject} />}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        // ListFooterComponent={renderFooter()}
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