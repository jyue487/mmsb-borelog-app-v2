import { Stack, router } from 'expo-router';
import * as SQLite from 'expo-sqlite';
import { useSQLiteContext } from 'expo-sqlite';
import React, { useEffect, useState } from 'react';
import { Alert, Button, FlatList, KeyboardAvoidingView, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { MaterialIcons } from '@expo/vector-icons';

// Local imports
import { Project } from '@/interfaces/Project';
import { styles } from '@/constants/styles';

type EditProjectInputFormProps = {
  oldProject: Project;
  editProject: (
    projectId: number, 
    projectTitle: string,
    location: string,
    client: string,
    consultant: string,
  ) => void;
  deleteProject: (projectId: number) => void;
  setIsEditState: React.Dispatch<React.SetStateAction<boolean>>;
}

export function EditProjectInputForm ({
  oldProject,
  editProject,
  deleteProject,
  setIsEditState
}: EditProjectInputFormProps) {

  const [newProjectCode, setNewProjectCode] = useState<string>(oldProject.code);
  const [newProjectTitle, setNewProjectTitle] = useState<string>(oldProject.title);
  const [location, setLocation] = useState<string>(oldProject.location);
  const [client, setClient] = useState<string>(oldProject.client);
  const [consultant, setConsultant] = useState<string>(oldProject.consultant);

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
        placeholderTextColor={'rgb(150, 150, 150)'}
        placeholder='PROJECT CODE'
        value={newProjectCode}
        editable={false}
        selectTextOnFocus={false}
      />
      <TextInput
        style={{
          padding: 10,
          height: 40,
          width: '60%',
          borderColor: 'gray',
          borderWidth: 1,
        }}
        placeholderTextColor={'rgb(150, 150, 150)'}
        placeholder='PROJECT NAME'
        value={newProjectTitle}
        onChangeText={text => setNewProjectTitle(text.toUpperCase())}
      />
      <TextInput
        style={{
          padding: 10,
          height: 40,
          width: '60%',
          borderColor: 'gray',
          borderWidth: 1,
        }}
        placeholderTextColor={'rgb(150, 150, 150)'}
        placeholder='Location'
        value={location}
        onChangeText={setLocation}
      />
      <TextInput
        style={{
          padding: 10,
          height: 40,
          width: '60%',
          borderColor: 'gray',
          borderWidth: 1,
        }}
        placeholderTextColor={'rgb(150, 150, 150)'}
        placeholder='Client'
        value={client}
        onChangeText={setClient}
      />
      <TextInput
        style={{
          padding: 10,
          height: 40,
          width: '60%',
          borderColor: 'gray',
          borderWidth: 1,
        }}
        placeholderTextColor={'rgb(150, 150, 150)'}
        placeholder='Consultant'
        value={consultant}
        onChangeText={setConsultant}
      />
      <Button
        title='Confirm'
        onPress={() => {
          if (!newProjectCode.trim()) {
            alert("Error: Project Code Should not be empty");
            return;
          }
          if (!newProjectTitle.trim()) {
            alert("Error: Project Name Should not be empty");
            return;
          }
          editProject(
            oldProject.id,
            newProjectTitle.trim(),
            location.trim(),
            client.trim(),
            consultant.trim(),
          )
          setIsEditState(false);
        }}
      />
      <Button
        title='Cancel'
        onPress={() => setIsEditState(false)}
      />
      <TouchableOpacity 
        onPress={() => {
          Alert.alert(
            "Delete Project",
            `Are you sure you want to delete project ${oldProject.title}?`,
            [
              { text: 'No, go back', style: 'cancel' },
              { text: 'Delete', style: 'destructive', onPress: () => deleteProject(oldProject.id) },
            ],
            { cancelable: true }
          );
        }}
        style={{ position: 'absolute', top: 10, left: 10 }}>
        <MaterialIcons name="delete" size={30} color="red" />
      </TouchableOpacity>
    </View>
  );
}