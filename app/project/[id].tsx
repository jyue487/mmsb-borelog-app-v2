import { Link, useLocalSearchParams } from 'expo-router';
import { View, Text, StyleSheet } from "react-native";

export default function ProjectScreen() {
	const { id } = useLocalSearchParams()

  return (
    <View style={styles.container}>
			<Text>Project {id}</Text>
			<Link href='/project/modal' >Add new modal</Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  link: {
    paddingTop: 20,
    fontSize: 20,
  },
});