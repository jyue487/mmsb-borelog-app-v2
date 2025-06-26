import { useEffect, useState } from 'react';
import { Link } from 'expo-router';
import { Button, View, Text, FlatList, StyleSheet } from "react-native";
import * as SQLite from 'expo-sqlite';

// Local imports
import { Project } from '../types/Project';

export default function ProjectListScreen() {
  const db = SQLite.openDatabaseSync('test.db');
  const [items, setItems] = useState<Project[]>([]);

  useEffect(() => {
    const initDb = async () => {
      await db.execAsync(
        `
        PRAGMA journal_mode = WAL;
        CREATE TABLE IF NOT EXISTS test (id INTEGER PRIMARY KEY NOT NULL, value TEXT NOT NULL, intValue INTEGER);
        `
      );
      await fetchAllItems();
    };
    initDb();
  }, []);

  const insertItem = async () => {
    await db.runAsync('INSERT INTO test (value, intValue) VALUES (?, ?)', 'aaa', 100);
    await fetchAllItems();
  };

  // `getAllAsync()` is useful when you want to get all results as an array of objects.
  const fetchAllItems = async () => {
    const rawItems = await db.getAllAsync('SELECT * FROM test');
    const items: Project[] = rawItems.map((row: any) => ({
      id: row.id
    }));
    setItems(items);
  };

  const clearDatabase = async () => {
    await db.runAsync(`DELETE FROM test;`);
    await fetchAllItems();
  };

  return (
    <View style={styles.container}>
      <Text>Project List:</Text>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <Link 
            href={{
              pathname: '/project/[id]',
              params: { id: item.id },
            }}>
            Project {item.id}
          </Link>
        )}
      />
      <Button
        title='Add item'
        onPress={insertItem}
      />
      <Button
        title='Clear Database'
        onPress={clearDatabase}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 20,
  },
  link: {
    paddingTop: 20,
    fontSize: 20,
  },
});