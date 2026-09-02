import React, { useState } from 'react';
import { Button, Text, TextInput, View } from "react-native";

// Local imports
import { styles } from '@/src/constants/styles';
import { Borehole, EditBoreholeParams } from '@mmsb/core';
import { stringIsFloat, stringToDecimalPoint } from '@/src/utils/numbers';
import { SignatureQuestionComponent } from '../signature/SignatureQuestionComponent';

type EditBoreholeInputFormProps = {
  oldBorehole: Borehole;
  editBorehole: (editBoreholeParams: EditBoreholeParams) => Promise<void>;
  setIsEditState: React.Dispatch<React.SetStateAction<boolean>>;
}

export function EditBoreholeInputForm ({
  oldBorehole,
  editBorehole,
  setIsEditState
}: EditBoreholeInputFormProps) {

  const [typeOfBoring, setTypeOfBoring] = useState<string>(oldBorehole.typeOfBoring);
  const [typeOfRig, setTypeOfRig] = useState<string>(oldBorehole.typeOfRig);
  const [diameterOfBoring, setDiameterOfBoring] = useState<string>(oldBorehole.diameterOfBoring);
  const [eastingInMetresStr, setEastingInMetresStr] = useState<string>(oldBorehole.eastingInMetres?.toFixed(3) ?? '');
  const [northingInMetresStr, setNorthingInMetersStr] = useState<string>(oldBorehole.northingInMetres?.toFixed(3) ?? '');
  const [reducedLevelInMetresStr, setReducedLevelInMetresStr] = useState<string>(oldBorehole.reducedLevelInMetres?.toFixed(3) ?? '');
  const [drillerName, setDrillerName] = useState<string>(oldBorehole.drillerName);
  const [verifierName, setVerifierName] = useState<string>(oldBorehole.verifierName);
  const [verifierSignatureBase64, setVerifierSignatureBase64] = useState<string>(oldBorehole.verifierSignatureBase64);

  return (
    <View style={styles.boreholeInputForm}>
      {/* The name identifies the borehole — it is the dashboard's URL key and
          what the report and the AGS export are filed under — so it is not a
          field here. Renaming is an owner/admin action on the dashboard, and the
          database enforces that with the boreholes_name_immutable trigger; see
          packages/supabase/policies/boreholes.sql. Mobile must not even send the
          column: the trigger RAISES, and Connector.ts rethrows rather than
          completing the transaction, so one rejected rename would stall every
          upload queued behind it on this device. */}
      <Text style={styles.boreholeReadOnlyName}>{oldBorehole.name.toUpperCase()}</Text>
      <Text style={styles.boreholeReadOnlyCaption}>Borehole name cannot be changed.</Text>
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
      <TextInput
        style={styles.projectAndBoreholeTextInput}
        placeholderTextColor={'rgb(150, 150, 150)'}
        placeholder='Driller Name'
        value={drillerName}
        onChangeText={setDrillerName}
      />
      <TextInput
        style={styles.projectAndBoreholeTextInput}
        placeholderTextColor={'rgb(150, 150, 150)'}
        placeholder='Verifier Name'
        value={verifierName}
        onChangeText={setVerifierName}
      />
      <SignatureQuestionComponent 
        verifierSignatureBase64={verifierSignatureBase64} 
        setVerifierSignatureBase64={setVerifierSignatureBase64} 
      />
      <Button
        title='Confirm'
        color={styles.confirmButton.color}
        onPress={async () => {
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
          
          await editBorehole({
            id: oldBorehole.id, 
            name: oldBorehole.name,
            typeOfBoring: typeOfBoring.trim(),
            typeOfRig: typeOfRig.trim(),
            diameterOfBoring: diameterOfBoring.trim(),
            eastingInMetres: eastingInMetres,
            northingInMetres: northingInMetres,
            reducedLevelInMetres: reducedLevelInMetres,
            drillerName: drillerName.trim(),
            verifierName: verifierName.trim(),
            verifierSignatureBase64: verifierSignatureBase64,
            verifierSignDate: (verifierSignatureBase64.length === 0) ? null : new Date(),
          })
          setIsEditState(false);
        }}
      />
      <Button
        title='Cancel'
        color={styles.cancelButton.color}
        onPress={() => setIsEditState(false)}
      />
    </View>
  );
}