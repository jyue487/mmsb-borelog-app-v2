import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" />
      <Stack.Screen name="project-list" />
      <Stack.Screen name="project/[id]" />
      <Stack.Screen 
        name="project/modal" 
        options={{
          presentation: 'modal',
        }}
      />
      <Stack.Screen name="+not-found" />
    </Stack>
  )
}