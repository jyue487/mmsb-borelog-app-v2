import React, { useState } from 'react';
import { Button, TextInput, View } from "react-native";

// Local imports
import { styles } from '@/constants/styles';

type AddProjectInputFormProps = {
  addProject: (
    code: string,
    title: string,
    location: string,
    client: string,
    consultant: string,
  ) => void;
  setIsAddButtonPressed: React.Dispatch<React.SetStateAction<boolean>>;
}

export function AddProjectInputForm ({
  addProject,
  setIsAddButtonPressed
}: AddProjectInputFormProps) {

  const [newProjectCode, setNewProjectCode] = useState<string>('');
  const [newProjectTitle, setNewProjectTitle] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [client, setClient] = useState<string>('');
  const [consultant, setConsultant] = useState<string>('');

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
        onChangeText={text => setNewProjectCode(text.toUpperCase())}
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
          addProject(
            newProjectCode.trim(), 
            newProjectTitle.trim(),
            location.trim(),
            client.trim(),
            consultant.trim(),
          );
          setIsAddButtonPressed(false);
        }}
      />
      <Button
        title='Cancel'
        onPress={() => setIsAddButtonPressed(false)}
      />
    </View>
  );
}