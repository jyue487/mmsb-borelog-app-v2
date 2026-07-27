import React, { useState } from 'react';
import { Alert, Button, TextInput, View } from "react-native";

// Local imports
import { styles } from '@/src/constants/styles';
import { EditProjectParams, Project } from '@/src/interfaces/Project';
import { TrashDeleteButton } from '../buttons/TrashDeleteButton';

type EditProjectInputFormProps = {
  oldProject: Project;
  editProject: (editProjectParams: EditProjectParams) => void;
  deleteProject: (projectId: string) => void;
  setIsEditState: React.Dispatch<React.SetStateAction<boolean>>;
};

export function EditProjectInputForm ({
  oldProject,
  editProject,
  deleteProject,
  setIsEditState
}: EditProjectInputFormProps) {

  const [projectCode, setProjectCode] = useState<string>(oldProject.code);
  const [projectTitle, setProjectTitle] = useState<string>(oldProject.title);
  const [location, setLocation] = useState<string>(oldProject.location);
  const [client, setClient] = useState<string>(oldProject.client);
  const [consultant, setConsultant] = useState<string>(oldProject.consultant);

  return (
    <View style={styles.projectInputForm}>
      <TextInput
        style={styles.projectAndBoreholeTextInput}
        placeholderTextColor={'rgb(150, 150, 150)'}
        placeholder='PROJECT CODE'
        value={projectCode}
        editable={false}
        selectTextOnFocus={false}
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
        color={styles.confirmButton.color}
        onPress={() => {
          if (!projectCode.trim()) {
            alert("Error: Project Code Should not be empty");
            return;
          }
          if (!projectTitle.trim()) {
            alert("Error: Project Name Should not be empty");
            return;
          }
          editProject({
            id: oldProject.id,
            title: projectTitle.trim(),
            location: location.trim(),
            client: client.trim(),
            consultant: consultant.trim(),
          })
          setIsEditState(false);
        }}
      />
      <Button
        title='Cancel'
        color={styles.cancelButton.color}
        onPress={() => setIsEditState(false)}
      />
      <TrashDeleteButton 
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
        style={{ position: 'absolute', top: 10, left: 10 }} 
      />
    </View>
  );
}