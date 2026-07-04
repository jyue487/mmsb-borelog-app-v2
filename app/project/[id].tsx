import { Stack, useLocalSearchParams } from 'expo-router';
import { SQLiteDatabase, SQLiteRunResult } from 'expo-sqlite';
import { useEffect, useRef, useState } from 'react';
import { Button, FlatList, Image, KeyboardAvoidingView, StyleSheet, View } from "react-native";

// Local Imports
import { AddBoreholeInputForm } from '@/components/borehole/AddBoreholeInputForm';
import { BoreholeComponent } from '@/components/borehole/BoreholeComponent';
import { addBoreholeDbAsync } from '@/db/borehole/addBoreholeDbAsync';
import { editBoreholeDbAsync } from '@/db/borehole/editBoreholeDbAsync';
import { AddBoreholeParams, Borehole, EditBoreholeParams } from '@/interfaces/Borehole';
import { powersync } from '@/powersync/system'; 
import { deserializeDateTime } from '@/json/deserializeDateTime';
import { useAuth } from '@/context/AuthContextProvider';

export default function ProjectScreen() {
  const { userId } = useAuth();
  const { id, title } = useLocalSearchParams();
  if (userId === null || typeof id != 'string' || typeof title != 'string') {
    throw new Error(`Error. id: ${id}`);
  }
  const projectId: string = id;
  const projectTitle: string = title;
  const [isAddButtonPressed, setIsAddButtonPressed] = useState<boolean>(false);
  const [boreholes, setBoreholes] = useState<Borehole[]>([]);

  useEffect(() => {
    const init = async () => {
      await fetchAllBoreholes();
    };
    init();
  }, []);

  const addBorehole = async (addBoreholeParams: AddBoreholeParams) => {
    try {
      const borehole: Borehole = await addBoreholeDbAsync(powersync, projectId, userId, addBoreholeParams);
      setBoreholes((prevBoreholes: Borehole[]) => [...prevBoreholes, borehole]);
    } catch (err) {
      const errMsg = `Error: ${err}`;
      alert(errMsg);
      console.log(errMsg);
    }
  };

  const deleteBorehole = async (boreholeId: string) => {
    try {
      console.log(`deleting borehole, id: ${boreholeId}`);
      await powersync.execute('DELETE FROM boreholes WHERE id = ?', [boreholeId]);
      setBoreholes((prevBoreholes: Borehole[]) => prevBoreholes.filter((bh: Borehole) => bh.id !== boreholeId));
    } catch (err) {
      const errMsg = `Error: ${err}`;
      alert(errMsg);
      console.log(errMsg);
    }
  };

  const editBorehole = async (editBoreholeParams: EditBoreholeParams) => {
    try {
      await editBoreholeDbAsync(powersync, editBoreholeParams);
      setBoreholes((prevBoreholes: Borehole[]) =>
        prevBoreholes.map((bh: Borehole): Borehole =>
          (bh.id === editBoreholeParams.id)
          ? { 
            ...editBoreholeParams,
            projectId: bh.projectId
          } 
          : {...bh}
        )
      );
    } catch (err) {
      const errMsg = `Error: ${err}`;
      alert(errMsg);
      console.log(errMsg);
    }
  };

  const fetchAllBoreholes = async () => {
    const rawBoreholes = await powersync.getAll(`SELECT * FROM boreholes WHERE project_id = ?;`, [projectId]);

    const boreholes: Borehole[] = rawBoreholes.map((row: any) => ({
      id: row.id,
      projectId: projectId,
      name: row.name,
      typeOfBoring: row.type_of_boring,
      typeOfRig: row.type_of_rig,
      diameterOfBoring: row.diameter_of_boring,
      eastingInMetres: row.easting_in_metres,
      northingInMetres: row.northing_in_metres,
      reducedLevelInMetres: row.reduced_level_in_metres,
      drillerName: row.driller_name,
      verifierName: row.verifier_name,
      verifierSignatureBase64: row.verifier_signature_base64,
      verifierSignDate: (row.verifier_sign_date === null) ? null : deserializeDateTime(row.verifier_sign_date),
    }));
    setBoreholes(boreholes);
  };

  const renderFooter = () => {
    return (
      <View style={{ gap: 20 }}>
      {
        !isAddButtonPressed && (
          <Button
            title='Add new Borehole'
            onPress={() => {
              setIsAddButtonPressed(true);
            }}
          />
        )
      }
      {
        isAddButtonPressed && <AddBoreholeInputForm addBorehole={addBorehole} setIsAddButtonPressed={setIsAddButtonPressed} />
      }
      </View>
    );
  };

  return (
    <KeyboardAvoidingView behavior='height' style={styles.container}>
      <Stack.Screen
        options={{
          title: (projectTitle.length < 10) ? projectTitle : `${projectTitle.slice(0, 10)}...`,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      />
      <FlatList
        data={boreholes}
        keyExtractor={(borehole: Borehole) => borehole.id}
        renderItem={({ item }) => <BoreholeComponent projectTitle={projectTitle} borehole={item} editBorehole={editBorehole} deleteBorehole={deleteBorehole} />}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        ListFooterComponent={renderFooter()}
        contentContainerStyle={{ paddingBottom: 500 }}
        style={{ flexGrow: 0, width: '100%' }}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    margin: 20,
  },
});