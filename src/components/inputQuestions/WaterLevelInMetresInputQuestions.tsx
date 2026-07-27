import { View, Text, TextInput } from "react-native";

type Props = {
  title: string;
  waterLevelInMetresStr: string; onChangeWaterLevelInMetresStr: (wl: string) => void;
};

export function WaterLevelInMetresInputQuestions({ 
  title,
  waterLevelInMetresStr, onChangeWaterLevelInMetresStr,
}: Props) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <Text>{title}: </Text>
      <TextInput
        value={waterLevelInMetresStr}
        onChangeText={onChangeWaterLevelInMetresStr}
        style={{ borderWidth: 0.5, alignItems: 'center', padding: 10, flex: 1, backgroundColor: 'yellow' }}
      />
    </View>
  );
}