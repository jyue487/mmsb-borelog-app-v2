import { initDb } from '@/db/initDb';
import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';

import { AuthContextProvider, AuthContextType, useAuth } from '@/context/AuthContextProvider';

function RootStack() {
  const { userId }: AuthContextType = useAuth();

  return (
    <Stack>
      <Stack.Protected guard={userId === null}>
        <Stack.Screen name="auth/sign-in" />
      </Stack.Protected>
      <Stack.Protected guard={userId !== null}>
        <Stack.Screen name="index" />
        <Stack.Screen name="project/[id]" />
        <Stack.Screen name="borehole/[id]" />
        <Stack.Screen name="settings/SettingsScreen" />
        <Stack.Screen name="+not-found" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthContextProvider>
      <RootStack />
    </AuthContextProvider>
  );
}
