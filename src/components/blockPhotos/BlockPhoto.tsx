import MaterialIcons from '@react-native-vector-icons/material-icons/static';
import { Image } from "expo-image";
import { useState } from "react";
import { Alert, Pressable, TouchableOpacity, View, ViewProps } from "react-native";

type Props = ViewProps & {
  id: string;
  uri: string;
  deletePhoto: (id: string, uri: string) => void;
};

export function BlockPhoto({ id, uri, deletePhoto, ...otherProps }: Props) {
  const [isEditState, setIsEditState] = useState<boolean>(false);

  return (
    <Pressable
      onLongPress={() => setIsEditState(true)}
      style={({ pressed }) => [
        { flexDirection: 'row-reverse' },
        !isEditState && pressed && { transform: [{ scale: 1.02 }], backgroundColor: 'white' },
      ]}
      {...otherProps}>

      {isEditState && (<View style={{ position: 'relative', flexDirection: 'column', width: 50 }}>
        <TouchableOpacity style={{ position: 'absolute', top: 20 }} onPress={() => setIsEditState(false)}>
          <MaterialIcons name="check-circle" size={50} color="green" />
        </TouchableOpacity>
        <TouchableOpacity
          style={{ position: 'absolute', bottom: 20 }}
          onPress={() => {
            Alert.alert(
              "Delete Photo",
              'Are you sure you want to delete this photo?',
              [
                { text: 'No, go back', style: 'cancel' },
                { text: 'Delete', style: 'destructive', onPress: () => deletePhoto(id, uri) },
              ],
              { cancelable: true }
            );
          }}>
          <MaterialIcons name="delete" size={50} color="red" />
        </TouchableOpacity>
      </View>)}
      <Image
        key={uri}
        source={uri}
        style={{ flex: 1, width: '80%', aspectRatio: 1 }}
        contentFit='contain'
      />
    </Pressable>
  );
}