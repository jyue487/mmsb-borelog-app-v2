import { Stack } from 'expo-router';
import { initDb } from '@/db/initDb';
import { useEffect, useState } from 'react';

import { supabase } from '@/db/supabase';

export default function RootLayout() {
  const [isDbReady, setIsDbReady] = useState<boolean>(false);
  const [userId, setUserId] = useState<string | null>(null)
  const [email, setEmail] = useState<string | undefined>(undefined)

  useEffect(() => {
    const init = async () => {
      await initDb();
      setIsDbReady(true);
    };
    init();
    supabase.auth.getClaims().then(({ data }) => {
      if (data === null) {
        console.log("getClaims: No data found");
        return;
      }
      const { claims } = data;
      if (claims) {
        setUserId(claims.sub);
        setEmail(claims.email);
      }
    })
    supabase.auth.onAuthStateChange(async (_event, _session) => {
      const { data } = await supabase.auth.getClaims();
      if (data === null) {
        console.log("getClaims: No data found");
        return;
      }
      const { claims } = data;
      if (claims) {
        setUserId(claims.sub);
        setEmail(claims.email);
        console.log(claims.email);
      } else {
        setUserId(null);
        setEmail(undefined);
      }
    })
  }, []);

  if (!isDbReady) {
    return null; // Or return a loading screen component
  }

  return (
    <Stack>
      <Stack.Protected guard={userId === null}>
        <Stack.Screen name="auth/sign-in" />
      </Stack.Protected>
      <Stack.Protected guard={userId !== null}>
        <Stack.Screen name="index" />
        <Stack.Screen name="project/[id]" />
        <Stack.Screen name="borehole/[id]" />
        <Stack.Screen name="settings/screen" />
        <Stack.Screen name="+not-found" />
      </Stack.Protected>
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
