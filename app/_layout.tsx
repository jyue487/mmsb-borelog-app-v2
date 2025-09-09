import { Stack } from 'expo-router';
import { initDb } from '@/db/initDb';
import { useEffect, useState } from 'react';
import { db } from '@/db/db';

export default function RootLayout() {
  const [isDbReady, setIsDbReady] = useState<boolean>(false);

  useEffect(() => {
    const init = async () => {
      await initDb();
      setIsDbReady(true);
    };
    init();
  }, []);

  if (!isDbReady) {
    return null; // Or return a loading screen component
  }

  return (
    <Stack>
      <Stack.Screen name="index" />
      <Stack.Screen name="project/[id]" />
      <Stack.Screen name="borehole/[id]" />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
  // return (
  //   <SQLiteProvider 
  //     databaseName='mmsb.db' 
  //     onInit={initDb}>
  //     <Stack>
  //       <Stack.Screen name="index" />
  //       <Stack.Screen name="project/[id]" />
  //       <Stack.Screen name="borehole/[id]" />
  //       <Stack.Screen name="+not-found" />
  //     </Stack>
  //   </SQLiteProvider>
  // );
}
