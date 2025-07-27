import { Stack, router } from 'expo-router';
import * as SQLite from 'expo-sqlite';
import { useSQLiteContext } from 'expo-sqlite';
import React, { useEffect, useState } from 'react';
import { Button, FlatList, KeyboardAvoidingView, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

// Local imports
import { Project } from '@/interfaces/Project';
import { styles } from '@/constants/styles';

type EditProjectInputFormProps = {
  oldProject: Project;
  editProject: (projectId: number, projectName: string) => void;
  setIsEditState: React.Dispatch<React.SetStateAction<boolean>>;
}

export function EditProjectInputForm ({
  oldProject,
  editProject,
  setIsEditState
}: EditProjectInputFormProps) {

  const [newProjectName, setNewProjectName] = useState<string>(oldProject.name);

  return (
    <View style={styles.projectInputForm}>
      <TextInput
        style={{
          padding: 10,
          height: 40,
          width: '60%',
          borderColor: 'gray',
          borderWidth: 1,
        }}
        placeholder='PROJECT NAME'
        value={newProjectName}
        onChangeText={text => setNewProjectName(text.toUpperCase())}
      />
      <Button
        title='Confirm'
        onPress={() => {
          if (!newProjectName.trim()) {
            alert("Error: Project Name Should not be empty");
            return;
          }
          editProject(oldProject.id, newProjectName.trim())
          setIsEditState(false);
        }}
      />
      <Button
        title='Cancel'
        onPress={() => setIsEditState(false)}
      />
      
    </View>
  );
}