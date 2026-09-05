import MaterialIcons from "@react-native-vector-icons/material-icons/static";
import { Stack, router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { FlatList, KeyboardAvoidingView, StyleSheet, TouchableOpacity, View } from "react-native";

// Local imports
import { ProjectComponent } from '@/src/components/project/ProjectComponent';
import { Project } from '@/src/interfaces/Project';
import { useAuth } from '@/src/context/AuthContextProvider';
import { powersync, setupPowerSync } from '@/src/powersync/system';
import { photoAttachmentQueue } from "@/src/storage/SupabaseRemoteStorageAdapter";
import { diagnoseSync } from '@/src/powersync/diagnoseSync';
import LoadingScreen from './loading';

/** How long to sit on the loading screen before showing local data anyway. */
const FIRST_SYNC_TIMEOUT_MS = 15_000;

export default function ProjectListScreen() {
  const { isSignIn } = useAuth();
  const [isPowersyncReady, setIsPowersyncReady] = useState<boolean>(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // [DIAG] temporary - remove after debugging the empty project list.
  console.log('[DIAG] render', { isSignIn, isPowersyncReady });

  // Connect once. This used to depend on [isPowersyncReady] while also setting
  // it, so the whole body ran a second time and called connect() on an already
  // connected database.
  useEffect(() => {
    const init = async () => {
      void diagnoseSync();
      console.log('[DIAG] init: calling setupPowerSync');
      await setupPowerSync();
      console.log('[DIAG] init: setupPowerSync returned', {
        connected: powersync.connected,
        status: JSON.stringify(powersync.currentStatus),
      });
      await photoAttachmentQueue.startSync();
      // Show whatever is already in the local database straight away, so a warm
      // start is instant and works with no signal.
      await fetchAllProjects();
    };

    init();
  }, []);

  // Then wait for the first sync to land and read again. Keyed on isSignIn
  // because that arrives asynchronously - the effect above runs before the
  // stored session has been restored.
  useEffect(() => {
    console.log('[DIAG] sync effect fired', { isSignIn });
    if (!isSignIn) {
      console.log('[DIAG] sync effect RETURNING EARLY - isSignIn is false');
      return;
    }

    let cancelled = false;
    // Bound the wait. waitForFirstSync resolves immediately once a device has
    // synced before, but on a first launch with no signal it would otherwise
    // never resolve and leave the crew stuck on the loading screen. Aborting
    // resolves the promise anyway; we then show whatever is in the local
    // database, which is the offline-first behaviour we want regardless.
    const giveUp = new AbortController();
    const timer = setTimeout(() => giveUp.abort(), FIRST_SYNC_TIMEOUT_MS);

    const waitForFirstSync = async () => {
      const startedAt = Date.now();
      console.log('[DIAG] waitForFirstSync: waiting...');
      await powersync.waitForFirstSync(giveUp.signal);
      console.log('[DIAG] waitForFirstSync: RESOLVED', {
        afterMs: Date.now() - startedAt,
        aborted: giveUp.signal.aborted,
        connected: powersync.connected,
        status: JSON.stringify(powersync.currentStatus),
      });
      if (cancelled) {
        console.log('[DIAG] waitForFirstSync: cancelled, not reading');
        return;
      }
      setIsPowersyncReady(true);
      await fetchAllProjects();
    };

    waitForFirstSync();

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [isSignIn]);

  // `getAllAsync()` is useful when you want to get all results as an array of objects.
  const fetchAllProjects = async () => {
    console.log(`fetchAllProjects called, powersync.connected ${powersync.connected}`);
    for (const t of ['projects', 'boreholes', 'blocks', 'block_photos']) {
      try {
        const c: any = await powersync.getAll(`SELECT count(*) AS n FROM ${t}`);
        console.log(`[DIAG] local rows in ${t}:`, c?.[0]?.n);
      } catch (e) {
        console.log(`[DIAG] local rows in ${t}: QUERY FAILED`, String(e));
      }
    }
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