import React, { useState } from 'react';
import { Button, TextInput, View } from "react-native";

// Local imports
import { styles } from '@/constants/styles';
import { isNonNegativeFloat, stringToDecimalPoint } from '@/utils/numbers';
import { AddBoreholeParams } from '@/interfaces/Borehole';

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
  const [diameterOfBoring, setDiameterOfBoring] = useState<string>('');
  const [eastingInMetresStr, setEastingInMetresStr] = useState<string>('');
  const [northingInMetresStr, setNorthingInMetersStr] = useState<string>('');
  const [reducedLevelInMetresStr, setReducedLevelInMetresStr] = useState<string>('');

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
        placeholderTextColor={'rgb(150, 150, 150)'}
        placeholder='BOREHOLE NAME'
        value={newBoreholeName}
        onChangeText={text => setNewBoreholeName(text.toUpperCase())}
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
        placeholder='Type of Boring'
        value={typeOfBoring}
        onChangeText={setTypeOfBoring}
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
        placeholder='Diameter of Boring'
        value={diameterOfBoring}
        onChangeText={setDiameterOfBoring}
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
        placeholder='Easting(m)'
        value={eastingInMetresStr}
        onChangeText={setEastingInMetresStr}
        keyboardType='numeric'
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
        placeholder='Northing(m)'
        value={northingInMetresStr}
        onChangeText={setNorthingInMetersStr}
        keyboardType='numeric'
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
        placeholder='Reduced Level(m)'
        value={reducedLevelInMetresStr}
        onChangeText={setReducedLevelInMetresStr}
        keyboardType='numeric'
      />
      <Button
        title='Confirm'
        onPress={() => {
          if (!newBoreholeName.trim()) {
            alert("Error: Borehole Name Should not be empty");
            return;
          }
          if (eastingInMetresStr.length > 0) {
            if (!isNonNegativeFloat(eastingInMetresStr)) {
              alert('Error: Easting');
            }
          }
          if (northingInMetresStr.length > 0) {
            if (!isNonNegativeFloat(northingInMetresStr)) {
              alert('Error: Northing');
            }
          }
          if (reducedLevelInMetresStr.length > 0) {
            if (!isNonNegativeFloat(reducedLevelInMetresStr)) {
              alert('Error: Reduced Level');
            }
          }

          const eastingInMetres: number | null = (eastingInMetresStr.length > 0) ? stringToDecimalPoint(eastingInMetresStr, 3) : null;
          const northingInMetres: number | null = (northingInMetresStr.length > 0) ? stringToDecimalPoint(northingInMetresStr, 3) : null;
          const reducedLevelInMetres: number | null = (reducedLevelInMetresStr.length > 0) ? stringToDecimalPoint(reducedLevelInMetresStr, 3) : null;

          addBorehole({
            name: newBoreholeName.trim(),
            typeOfBoring: typeOfBoring.trim(),
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
    </View>
  );
}