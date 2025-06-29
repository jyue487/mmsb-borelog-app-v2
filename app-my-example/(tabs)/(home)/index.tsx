import { Link } from 'expo-router';
import { View, Text, StyleSheet } from "react-native";

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text>Home</Text>
      <Link 
        href={{
          pathname: '/details/[id]',
          params: { id: 'beef' },
        }}>
        View user details
      </Link>
      <Link href='/modal' style={styles.link}>
        View modal
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