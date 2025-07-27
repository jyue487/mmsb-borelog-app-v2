import React, { useState } from 'react';
import { Button, TextInput, View } from "react-native";

// Local imports
import { styles } from '@/constants/styles';
import { Borehole } from '@/interfaces/Borehole';

type EditBoreholeInputFormProps = {
  oldBorehole: Borehole;
  editBorehole: (boreholeId: number, boreholeName: string) => void;
  setIsEditState: React.Dispatch<React.SetStateAction<boolean>>;
}

export function EditBoreholeInputForm ({
  oldBorehole,
  editBorehole,
  setIsEditState
}: EditBoreholeInputFormProps) {

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
          editBorehole(oldBorehole.id, newBoreholeName.trim())
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