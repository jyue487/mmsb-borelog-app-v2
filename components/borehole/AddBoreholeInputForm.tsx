import React, { useState } from 'react';
import { Button, KeyboardAvoidingView, TextInput } from "react-native";

// Local imports
import { styles } from '@/constants/styles';
import { AddBoreholeParams } from '@/interfaces/Borehole';
import { stringIsFloat, stringToDecimalPoint } from '@/utils/numbers';

type AddBoreholeInputFormProps = {
  addBorehole: (addBoreholeParams: AddBoreholeParams) => void;
  setIsAddButtonPressed: React.Dispatch<React.SetStateAction<boolean>>;
}

export function AddBoreholeInputForm ({
  addBorehole,
  setIsAddButtonPressed
}: AddBoreholeInputFormProps) {

  const [newBoreholeName, setNewBoreholeName] = useState<string>('');
  const [typeOfBoring, setTypeOfBoring] = useState<string>('');
  const [typeOfRig, setTypeOfRig] = useState<string>('');
  const [diameterOfBoring, setDiameterOfBoring] = useState<string>('');
  const [eastingInMetresStr, setEastingInMetresStr] = useState<string>('');
  const [northingInMetresStr, setNorthingInMetersStr] = useState<string>('');
  const [reducedLevelInMetresStr, setReducedLevelInMetresStr] = useState<string>('');

  return (
    <KeyboardAvoidingView style={styles.boreholeInputForm}>
      <TextInput
        style={styles.projectAndBoreholeTextInput}
        placeholderTextColor={'rgb(150, 150, 150)'}
        placeholder='BOREHOLE NAME'
        value={newBoreholeName}
        onChangeText={text => setNewBoreholeName(text.toUpperCase())}
      />
      <TextInput
        style={styles.projectAndBoreholeTextInput}
        placeholderTextColor={'rgb(150, 150, 150)'}
        placeholder='Type of Boring'
        value={typeOfBoring}
        onChangeText={setTypeOfBoring}
      />
      <TextInput
        style={styles.projectAndBoreholeTextInput}
        placeholderTextColor={'rgb(150, 150, 150)'}
        placeholder='Type of Rig'
        value={typeOfRig}
        onChangeText={setTypeOfRig}
      />
      <TextInput
        style={styles.projectAndBoreholeTextInput}
        placeholderTextColor={'rgb(150, 150, 150)'}
        placeholder='Diameter of Boring'
        value={diameterOfBoring}
        onChangeText={setDiameterOfBoring}
      />
      <TextInput
        style={styles.projectAndBoreholeTextInput}
        placeholderTextColor={'rgb(150, 150, 150)'}
        placeholder='Easting(m)'
        value={eastingInMetresStr}
        onChangeText={setEastingInMetresStr}
      />
      <TextInput
        style={styles.projectAndBoreholeTextInput}
        placeholderTextColor={'rgb(150, 150, 150)'}
        placeholder='Northing(m)'
        value={northingInMetresStr}
        onChangeText={setNorthingInMetersStr}
      />
      <TextInput
        style={styles.projectAndBoreholeTextInput}
        placeholderTextColor={'rgb(150, 150, 150)'}
        placeholder='Reduced Level(m)'
        value={reducedLevelInMetresStr}
        onChangeText={setReducedLevelInMetresStr}
      />
      <Button
        title='Confirm'
        onPress={() => {
          if (!newBoreholeName.trim()) {
            alert("Error: Borehole Name Should not be empty");
            return;
          }
          if (eastingInMetresStr.trim().length > 0) {
            if (!stringIsFloat(eastingInMetresStr.trim())) {
              alert('Error: Easting');
            }
          }
          if (northingInMetresStr.trim().length > 0) {
            if (!stringIsFloat(northingInMetresStr.trim())) {
              alert('Error: Northing');
            }
          }
          if (reducedLevelInMetresStr.trim().length > 0) {
            if (!stringIsFloat(reducedLevelInMetresStr.trim())) {
              alert('Error: Reduced Level');
            }
          }

          const eastingInMetres: number | null = (eastingInMetresStr.trim().length > 0) ? stringToDecimalPoint(eastingInMetresStr.trim(), 3) : null;
          const northingInMetres: number | null = (northingInMetresStr.trim().length > 0) ? stringToDecimalPoint(northingInMetresStr.trim(), 3) : null;
          const reducedLevelInMetres: number | null = (reducedLevelInMetresStr.trim().length > 0) ? stringToDecimalPoint(reducedLevelInMetresStr.trim(), 3) : null;

          addBorehole({
            name: newBoreholeName.trim(),
            typeOfBoring: typeOfBoring.trim(),
            typeOfRig: typeOfRig.trim(),
            diameterOfBoring: diameterOfBoring.trim(),
            eastingInMetres: eastingInMetres,
            northingInMetres: northingInMetres,
            reducedLevelInMetres: reducedLevelInMetres,
          });
          setIsAddButtonPressed(false);
        }}
      />
      <Button
        title='Cancel'
        onPress={() => setIsAddButtonPressed(false)}
      />
    </KeyboardAvoidingView>
  );
}