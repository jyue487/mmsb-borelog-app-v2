import { Link } from 'expo-router';
import { View, Text, StyleSheet } from "react-native";

export default function ProjectListScreen() {
  return (
    <View style={styles.container}>
        <Text>Project List:</Text>
        <Link 
          href={{
            pathname: '/project/[id]',
            params: { id: 'beef' },
          }}>
          Project 1
        </Link>
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