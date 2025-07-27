import React, { useState } from 'react';
import { Button, TextInput, View } from "react-native";

// Local imports
import { styles } from '@/constants/styles';

type AddProjectInputFormProps = {
  addProject: (projectName: string) => void;
  setIsAddButtonPressed: React.Dispatch<React.SetStateAction<boolean>>;
}

export function AddProjectInputForm ({
  addProject,
  setIsAddButtonPressed
}: AddProjectInputFormProps) {

  const [newProjectName, setNewProjectName] = useState<string>('');

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
          addProject(newProjectName.trim())
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