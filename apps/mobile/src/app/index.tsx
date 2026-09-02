import MaterialIcons from "@react-native-vector-icons/material-icons/static";
import { Stack, router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { FlatList, KeyboardAvoidingView, StyleSheet, TouchableOpacity, View } from "react-native";

// Local imports
import { ProjectComponent } from '@/src/components/project/ProjectComponent';
import { Project } from '@/src/interfaces/Project';
import { useAuth } from '@/src/context/AuthContextProvider';
import { supabase } from '@/src/db/supabase';
import { powersync, setupPowerSync } from '@/src/powersync/system';
import { photoAttachmentQueue } from "@/src/storage/SupabaseRemoteStorageAdapter";
import LoadingScreen from './loading';

export default function ProjectListScreen() {
  const { isSignIn } = useAuth();
  const [isPowersyncReady, setIsPowersyncReady] = useState<boolean>(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [refreshing, setRefreshing] = useState<boolean>(false);

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
      await photoAttachmentQueue.startSync();
      await fetchAllProjects();
    };

    init();
  }, [isPowersyncReady]);

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

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchAllProjects();
    } catch (error) {
      console.error(error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  if (isSignIn && !isPowersyncReady) {
    console.log("Signed in but powersync is not ready");
    return <LoadingScreen displayText="Signing In" />;
  }

  return (
    <>
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
      <KeyboardAvoidingView behavior='height' style={styles.container}>
        <FlatList
          data={projects}
          keyExtractor={(project: Project) => project.id.toString()}
          renderItem={({ item }) => <ProjectComponent project={item} />}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          contentContainerStyle={{ paddingBottom: 500 }}
          style={{ flexGrow: 0, width: '100%' }}
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
      </KeyboardAvoidingView>
    </>
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