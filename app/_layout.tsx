import { SQLiteProvider } from 'expo-sqlite';
import { Stack } from 'expo-router';
import { initDb } from '@/db/initDb';

export default function RootLayout() {
  return (
    <SQLiteProvider 
      databaseName='mmsb.db' 
      onInit={initDb}>
      <Stack>
        <Stack.Screen name="index" />
        <Stack.Screen name="project/[id]" />
        <Stack.Screen name="borehole/[id]" />
        <Stack.Screen name="+not-found" />
      </Stack>
    </SQLiteProvider>
  )
}