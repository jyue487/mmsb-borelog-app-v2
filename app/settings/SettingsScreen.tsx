import { Stack } from 'expo-router';
import { View, Text } from 'react-native';

import { SignOutButtonComponent } from '@/components/auth/SignOutButtonComponent';
import { useAuth } from '@/context/AuthContextProvider';

export default function SettingsScreen() {
  const { email } = useAuth();

  return (
    <>
      <Stack.Screen options={{ title: 'Settings' }} />
      <View>
        <View style={{ padding: 10 }}>
          <Text style={{ fontSize: 16 }}>
            Currently signed in as <Text style={{ fontWeight: "bold", color: "blue" }}>{email}</Text>
          </Text>
        </View>
        <SignOutButtonComponent />
      </View>
    </>
  );
}
