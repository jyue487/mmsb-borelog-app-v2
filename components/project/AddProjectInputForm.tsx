import React, { useState } from 'react';
import { Button, TextInput, View } from "react-native";

// Local imports
import { styles } from '@/constants/styles';
import { AddProjectParams } from '@/interfaces/Project';

type AddProjectInputFormProps = {
  addProject: (projectParams: AddProjectParams) => void;
  setIsAddButtonPressed: React.Dispatch<React.SetStateAction<boolean>>;
}

export function AddProjectInputForm ({
  addProject,
  setIsAddButtonPressed
}: AddProjectInputFormProps) {

  const [projectCode, setProjectCode] = useState<string>('');
  const [projectTitle, setProjectTitle] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [client, setClient] = useState<string>('');
  const [consultant, setConsultant] = useState<string>('');

  return (
    <View style={styles.projectInputForm}>
      <TextInput
        style={styles.projectAndBoreholeTextInput}
        placeholderTextColor={'rgb(150, 150, 150)'}
        placeholder='PROJECT CODE'
        value={projectCode}
        onChangeText={text => setProjectCode(text.toUpperCase())}
        multiline={true}
      />
      <TextInput
        style={styles.projectAndBoreholeTextInput}
        placeholderTextColor={'rgb(150, 150, 150)'}
        placeholder='PROJECT NAME'
        value={projectTitle}
        onChangeText={text => setProjectTitle(text.toUpperCase())}
        multiline={true}
      />
      <TextInput
        style={styles.projectAndBoreholeTextInput}
        placeholderTextColor={'rgb(150, 150, 150)'}
        placeholder='Location'
        value={location}
        onChangeText={setLocation}
        multiline={true}
      />
      <TextInput
        style={styles.projectAndBoreholeTextInput}
        placeholderTextColor={'rgb(150, 150, 150)'}
        placeholder='Client'
        value={client}
        onChangeText={setClient}
        multiline={true}
      />
      <TextInput
        style={styles.projectAndBoreholeTextInput}
        placeholderTextColor={'rgb(150, 150, 150)'}
        placeholder='Consultant'
        value={consultant}
        onChangeText={setConsultant}
        multiline={true}
      />
      <Button
        title='Confirm'
        onPress={() => {
          if (!projectCode.trim()) {
            alert("Error: Project Code Should not be empty");
            return;
          }
          if (!projectTitle.trim()) {
            alert("Error: Project Name Should not be empty");
            return;
          }
          addProject({
            code: projectCode.trim(), 
            title: projectTitle.trim(),
            location: location.trim(),
            client: client.trim(),
            consultant: consultant.trim(),
          });
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