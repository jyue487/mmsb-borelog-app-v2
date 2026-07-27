import { Alert, TouchableOpacity, type ViewProps } from "react-native";
import MaterialIcons from "@react-native-vector-icons/material-icons/static";

type Props = ViewProps & {
  onPress: () => void;
};

export function TrashDeleteButton({ style, onPress }: Props) {
  return (
    <TouchableOpacity 
      onPress={onPress}
      style={style}>
      <MaterialIcons name="delete" size={30} color="red" />
    </TouchableOpacity>
  );
}