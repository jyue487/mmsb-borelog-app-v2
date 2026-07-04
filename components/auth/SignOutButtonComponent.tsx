import { TouchableOpacity, Text, View } from "react-native";
import MaterialIcons from "@react-native-vector-icons/material-icons/static";

import { supabase } from '@/db/supabase';
import { powersync } from "@/powersync/system";

export function SignOutButtonComponent() {
  return (
    <TouchableOpacity 
      onPress={async () => {
        await powersync.disconnectAndClear();
        await supabase.auth.signOut({ scope: 'global' });
      }}
      style={{ backgroundColor: "red", padding: 5, flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 5 }}
    >
      <Text style={{ fontWeight: "bold", fontSize: 16, color: "white" }}>Sign Out</Text>
      <MaterialIcons name="logout" size={30} color="white" />
    </TouchableOpacity>
  );
}