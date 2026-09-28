import MaterialIcons from "@react-native-vector-icons/material-icons/static";
import { Alert, Text, TouchableOpacity } from "react-native";

import { supabase } from '@/src/db/supabase';
import { powersync } from "@/src/powersync/system";

export function SignOutButtonComponent() {
  return (
    <TouchableOpacity
      onPress={async () => {
        // disconnectAndClear() empties the upload queue along with the synced
        // tables — clearLocal only spares local-only tables, of which there are
        // none. Anything still queued exists nowhere else, so signing out with it
        // pending destroys it. That is how a borehole's blocks were lost when
        // one bad row had stalled the queue behind it.
        const { count } = await powersync.getUploadQueueStats();
        if (count > 0) {
          Alert.alert(
            'Changes not uploaded yet',
            `${count} change(s) on this device have not reached the server. ` +
            'Signing out now would delete them. Connect to the internet, wait for ' +
            'them to upload, then sign out.'
          );
          return;
        }
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
