import React, { useState } from 'react';
import { Button, TextInput, View } from "react-native";

// Local imports
import { styles } from '@/constants/styles';

type AddBoreholeInputFormProps = {
  projectId: number,
  addBorehole: (projectId: number, boreholeName: string) => void;
  setIsAddButtonPressed: React.Dispatch<React.SetStateAction<boolean>>;
}

export function AddBoreholeInputForm ({
  projectId,
  addBorehole,
  setIsAddButtonPressed
}: AddBoreholeInputFormProps) {

  const [newBoreholeName, setNewBoreholeName] = useState<string>('');

  return (
    <View style={styles.boreholeInputForm}>
      <TextInput
        style={{
          padding: 10,
          height: 40,
          width: '60%',
          borderColor: 'gray',
          borderWidth: 1,
        }}
        placeholder='BOREHOLE NAME'
        value={newBoreholeName}
        onChangeText={text => setNewBoreholeName(text.toUpperCase())}
      />
      <Button
        title='Confirm'
        onPress={() => {
          if (!newBoreholeName.trim()) {
            alert("Error: Borehole Name Should not be empty");
            return;
          }
          addBorehole(projectId, newBoreholeName.trim())
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