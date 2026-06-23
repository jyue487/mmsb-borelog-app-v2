import { Stack } from 'expo-router';
import { useState } from 'react';
import { View, Text } from 'react-native';

import { supabase } from '@/db/supabase';
import { SignOutButtonComponent } from '@/components/auth/SignOutButtonComponent';

export default function SettingsScreen() {
  const [email, setEmail] = useState<string | undefined>(undefined)

  supabase.auth.getUser().then(({ data: { user } }) => {
    setEmail(user?.email);
  });

  return (
    <View>
      <Stack.Screen 
        options={{
          title: 'Settings',
        }}
      />
      <View style={{ padding: 10 }}>
        <Text style={{ fontSize: 16 }}>
          Currently signed in as <Text style={{ fontWeight: "bold", color: "blue" }}>{email}</Text>
        </Text>
      </View>
      <SignOutButtonComponent />
    </View>
  );
}
