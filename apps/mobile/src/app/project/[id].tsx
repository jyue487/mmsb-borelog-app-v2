import { Stack, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Button, FlatList, KeyboardAvoidingView, StyleSheet, View } from "react-native";

// Local Imports
import { AddBoreholeInputForm } from '@/src/components/borehole/AddBoreholeInputForm';
import { BoreholeComponent } from '@/src/components/borehole/BoreholeComponent';
import { useAuth } from '@/src/context/AuthContextProvider';
import { addBoreholeDbAsync } from '@/src/db/borehole/addBoreholeDbAsync';
import { editBoreholeDbAsync } from '@/src/db/borehole/editBoreholeDbAsync';
import { AddBoreholeParams, Borehole, EditBoreholeParams, toDate } from '@mmsb/core';
import { powersync, setupPowerSync } from '@/src/powersync/system';
import { throwError } from '@/src/utils/error/throwError';

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
  const [refreshing, setRefreshing] = useState<boolean>(false);

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
      throwError(err);
    }
  };

  // There is deliberately no deleteBorehole here. `boreholes` has no delete
  // policy for supervisors, and RLS FILTERS rows on delete rather than raising —
  // so the old handler removed the row locally, PostgREST reported success having
  // deleted nothing, and the next sync brought the borehole straight back. See
  // packages/supabase/policies/boreholes.sql. Deleting a borehole is a dashboard
  // action.

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
            : { ...bh }
        )
      );
    } catch (err) {
      throwError(err);
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
      verifierSignDate: toDate(row.verifier_sign_date),
    }));
    setBoreholes(boreholes.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' })));
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
        {isAddButtonPressed && <AddBoreholeInputForm addBorehole={addBorehole} setIsAddButtonPressed={setIsAddButtonPressed} />}
        <Button title='Disconnect Powersync' onPress={async () => await powersync.disconnectAndClear()} />
        <Button title='Connect Powersync' onPress={async () => await setupPowerSync()} />
      </View>
    );
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchAllBoreholes();
    } catch (error) {
      console.error(error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  return (
    <>
      <Stack.Screen
        options={{
          title: (projectTitle.length < 10) ? projectTitle : `${projectTitle.slice(0, 10)}...`,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      />
      <KeyboardAvoidingView behavior='height' style={styles.container}>
        <FlatList
          data={boreholes}
          keyExtractor={(borehole: Borehole) => borehole.id}
          renderItem={({ item }) => <BoreholeComponent projectTitle={projectTitle} borehole={item} editBorehole={editBorehole} />}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          // ListFooterComponent={renderFooter()}
          contentContainerStyle={{ paddingBottom: 500 }}
          style={{ flexGrow: 0, width: '100%' }}
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    margin: 20,
  },
});