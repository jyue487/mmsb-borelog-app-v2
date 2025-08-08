import React, { useState } from 'react';
import { Alert, Button, TextInput, TouchableOpacity, View } from "react-native";

// Local imports
import { styles } from '@/constants/styles';
import { Borehole, EditBoreholeParams } from '@/interfaces/Borehole';
import { stringIsFloat, stringToDecimalPoint } from '@/utils/numbers';
import { MaterialIcons } from '@expo/vector-icons';

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
  const [typeOfRig, setTypeOfRig] = useState<string>(oldBorehole.typeOfRig);
  const [diameterOfBoring, setDiameterOfBoring] = useState<string>(oldBorehole.diameterOfBoring);
  const [eastingInMetresStr, setEastingInMetresStr] = useState<string>(oldBorehole.eastingInMetres?.toFixed(3) ?? '');
  const [northingInMetresStr, setNorthingInMetersStr] = useState<string>(oldBorehole.northingInMetres?.toFixed(3) ?? '');
  const [reducedLevelInMetresStr, setReducedLevelInMetresStr] = useState<string>(oldBorehole.reducedLevelInMetres?.toFixed(3) ?? '');

  return (
    <View style={styles.boreholeInputForm}>
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
        placeholderTextColor={'hsl(0, 0.00%, 58.80%)'}
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
          
          editBorehole({
            id: oldBorehole.id, 
            name: newBoreholeName.trim(),
            typeOfBoring: typeOfBoring.trim(),
            typeOfRig: typeOfRig.trim(),
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