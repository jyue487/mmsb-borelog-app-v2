import { Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Button, FlatList, KeyboardAvoidingView, Platform, StyleSheet, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

// Local Imports
import { BlockComponent } from '@/components/blockComponents/BlockComponent';
import { BlockDetailsInputForm } from '@/components/blockDetailsInputForms/BlockDetailsInputForm';
import { deleteBlockByBlockIdDbAsync } from '@/db/blocks/deleteBlockByBlockIdDbAsync';
import { fetchAllBlocksByBoreholeIdDbAsync } from '@/db/blocks/fetchAllBlocksByBoreholeIdDbAsync';
import { fetchBoreholeByIdAsync } from '@/db/borehole/fetchBoreholeByIdAsync';
import { fetchProjectByIdAsync } from '@/db/project/fetchProjectByIdAsync';
import { Block } from '@/interfaces/Block';
import { Borehole } from '@/interfaces/Borehole';
import { Project } from '@/interfaces/Project';
import { sharePdf } from '@/utils/pdf/sharePdf';
import LoadingScreen from '../loading';
import { sortBlocks } from '@/utils/block/sortBlocksFunctions/sortBlocks';
import { reindexAllBlocks } from '@/utils/block/reindexBlocksFunctions/reindexBlock';
import { sortAndReindexAllBlocks } from '@/utils/block/handleAllBlocksFrontEnd/sortAndReindexAllBlocks';
// import { shareExcel } from '@/utils/excel/shareExcel';

export default function BoreholeScreen() {
  const { id, projectTitle, name } = useLocalSearchParams();
  if (typeof id != 'string' || typeof projectTitle != 'string' || typeof name != 'string') {
    throw new Error(`Error. id: ${id}, projectTitle: ${projectTitle}, name: ${name}`);
  }
  const boreholeId: string = id;
  const boreholeName: string = name;
  const [project, setProject] = useState<Project | null>(null);
  const [borehole, setBorehole] = useState<Borehole | null>(null);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [isAddNewBlockButtonPressed, setIsAddNewBlockButtonPressed] = useState<boolean>(false);

  useEffect(() => {
    const init = async () => {
      try {
        const fetchedBorehole: Borehole | null = await fetchBoreholeByIdAsync(boreholeId);
        console.log('fetchedBorehole', fetchedBorehole);

        if (!fetchedBorehole) {
          console.log("No borehole found for id:", boreholeId);
          return;
        }

        const fetchedProject: Project | null = await fetchProjectByIdAsync(fetchedBorehole.projectId);
        console.log('fetchedProject', fetchedProject);

        if (!fetchedProject) {
          console.log("No project found for id:", fetchedBorehole.projectId);
          return;
        }

        const fetchedBlocks: Block[] = sortAndReindexAllBlocks(await fetchAllBlocksByBoreholeIdDbAsync(boreholeId));

        console.log('fetchedBlocks', fetchedBlocks.length);

        setBorehole(fetchedBorehole);
        setProject(fetchedProject);
        setBlocks(fetchedBlocks);
      } catch (error) {
        console.error("Failed to load borehole page:", error);
      }
    };

    init();
  }, [boreholeId]);

  if (!borehole || !project) {
    return (
      <LoadingScreen displayText='Loading' />
    );
  }

  const renderFooter = () => (
    <View style={{ gap: 20 }}>
      {
        !isAddNewBlockButtonPressed && (
          <Button
            title='Add new block'
            onPress={() => {
              setIsAddNewBlockButtonPressed(true);
            }}
          />
        )
      }
      {
        isAddNewBlockButtonPressed && (
          <BlockDetailsInputForm
            blocks={blocks}
            setBlocks={setBlocks}
            boreholeId={boreholeId}
            inputBlock={null}
            setIsVisible={setIsAddNewBlockButtonPressed}
            action='add'
          />
        )
      }
      {/* <Button
        title='Share PDF'
        onPress={() => sharePdf(project, borehole, blocks)}
      /> */}
      {/* <Button 
        title='Share Excel'
        onPress={() => shareExcel(blocks)} // TODO: Implement shareJson instead
      /> */}
    </View>
  );



  return (
    <>
      <Stack.Screen
        options={{
          title: `${(projectTitle.length < 10) ? projectTitle : projectTitle.slice(0, 10)}... / ${boreholeName.toUpperCase()}`,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      />
      <GestureHandlerRootView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.container}>
          <FlatList
            data={blocks}
            keyExtractor={(block: Block) => block.id.toString()}
            renderItem={({ item }) => <BlockComponent block={item} blocks={blocks} setBlocks={setBlocks} />}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            ListFooterComponent={renderFooter}
            contentContainerStyle={{ paddingBottom: 500 }}
            style={{ width: '100%', borderTopWidth: 1 }}
          />
        </KeyboardAvoidingView>
      </GestureHandlerRootView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  link: {
    paddingTop: 20,
    fontSize: 20,
  },
});
