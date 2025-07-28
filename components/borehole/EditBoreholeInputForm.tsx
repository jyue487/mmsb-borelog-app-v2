import React, { useState } from 'react';
import { Alert, Button, TextInput, TouchableOpacity, View } from "react-native";

// Local imports
import { styles } from '@/constants/styles';
import { Borehole, EditBoreholeParams } from '@/interfaces/Borehole';
import { MaterialIcons } from '@expo/vector-icons';
import { isNonNegativeFloat, stringToDecimalPoint } from '@/utils/numbers';

type EditBoreholeInputFormProps = {
  oldBorehole: Borehole;
  editBorehole: (editBoreholeParams: EditBoreholeParams) => void;
  deleteBorehole: (boreholeId: number) => void;
  setIsEditState: React.Dispatch<React.SetStateAction<boolean>>;
}

export function EditBoreholeInputForm ({
  oldBorehole,
  editBorehole,
  deleteBorehole,
  setIsEditState
}: EditBoreholeInputFormProps) {

  const [newBoreholeName, setNewBoreholeName] = useState<string>(oldBorehole.name);
  const [typeOfBoring, setTypeOfBoring] = useState<string>(oldBorehole.typeOfBoring);
  const [diameterOfBoring, setDiameterOfBoring] = useState<string>(oldBorehole.diameterOfBoring);
  const [eastingInMetresStr, setEastingInMetresStr] = useState<string>(oldBorehole.eastingInMetres?.toFixed(3) ?? '');
  const [northingInMetresStr, setNorthingInMetersStr] = useState<string>(oldBorehole.northingInMetres?.toFixed(3) ?? '');
  const [reducedLevelInMetresStr, setReducedLevelInMetresStr] = useState<string>(oldBorehole.reducedLevelInMetres?.toFixed(3) ?? '');

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
          
          editBorehole({
            id: oldBorehole.id, 
            name: newBoreholeName.trim(),
            typeOfBoring: typeOfBoring.trim(),
            diameterOfBoring: diameterOfBoring.trim(),
            eastingInMetres: eastingInMetres,
            northingInMetres: northingInMetres,
            reducedLevelInMetres: reducedLevelInMetres,
          })
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
            "Delete Borehole",
            `Are you sure you want to delete borehole ${oldBorehole.name}?`,
            [
              { text: 'No, go back', style: 'cancel' },
              { text: 'Delete', style: 'destructive', onPress: () => deleteBorehole(oldBorehole.id) },
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