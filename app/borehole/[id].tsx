import * as FileSystem from 'expo-file-system';
import * as Print from 'expo-print';
import { Stack, useLocalSearchParams } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { useEffect, useState } from 'react';
import { Button, FlatList, KeyboardAvoidingView, Platform, StyleSheet, Text, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

// Local Imports
import { AsphaltBlockComponent } from '@/components/blockComponents/AsphaltBlockComponent';
import { CavityBlockComponent } from '@/components/blockComponents/CavityBlockComponent';
import { ConcreteSlabBlockComponent } from '@/components/blockComponents/ConcreteSlabBlockComponent';
import { ConstantHeadPermeabilityTestBlockComponent } from '@/components/blockComponents/ConstantHeadPermeabilityTestBlockComponent';
import { CoringBlockComponent } from '@/components/blockComponents/CoringBlockComponent';
import { CustomBlockComponent } from '@/components/blockComponents/CustomBlockComponent';
import { EndOfBoreholeBlockComponent } from '@/components/blockComponents/EndOfBoreholeBlockComponent';
import { FallingHeadPermeabilityTestBlockComponent } from '@/components/blockComponents/FallingHeadPermeabilityTestBlockComponent';
import { HaBlockComponent } from '@/components/blockComponents/HaBlockComponent';
import { LugeonTestBlockComponent } from '@/components/blockComponents/LugeonTestBlockComponent';
import { MzBlockComponent } from '@/components/blockComponents/MzBlockComponent';
import { PressuremeterTestBlockComponent } from '@/components/blockComponents/PressuremeterTestBlockComponent';
import { PsBlockComponent } from '@/components/blockComponents/PsBlockComponent';
import { RisingHeadPermeabilityTestBlockComponent } from '@/components/blockComponents/RisingHeadPermeabilityTestBlockComponent';
import { SptBlockComponent } from '@/components/blockComponents/SptBlockComponent';
import { UdBlockComponent } from '@/components/blockComponents/UdBlockComponent';
import { VaneShearTestBlockComponent } from '@/components/blockComponents/VaneShearTestBlockComponent';
import { WashBoringBlockComponent } from '@/components/blockComponents/WashBoringBlockComponent';
import { AddNewBlockDetailsInputForm } from '@/components/blockDetailsInputForms/AddNewBlockDetailsInputForm';
import { fetchAllBlocksByBoreholeIdDbAsync } from '@/db/blocks/fetchAllBlocksByBoreholeIdDbAsync';
import { fetchBoreholeByIdAsync } from '@/db/borehole/fetchBoreholeByIdAsync';
import { fetchProjectByIdAsync } from '@/db/project/fetchProjectByIdAsync';
import { ASPHALT_BLOCK_TYPE_ID, Block, CAVITY_BLOCK_TYPE_ID, CONCRETE_SLAB_BLOCK_TYPE_ID, CONSTANT_HEAD_PERMEABILITY_TEST_BLOCK_TYPE_ID, CORING_BLOCK_TYPE_ID, CUSTOM_BLOCK_TYPE_ID, END_OF_BOREHOLE_BLOCK_TYPE_ID, FALLING_HEAD_PERMEABILITY_TEST_BLOCK_TYPE_ID, HA_BLOCK_TYPE_ID, LUGEON_TEST_BLOCK_TYPE_ID, MZ_BLOCK_TYPE_ID, PRESSUREMETER_TEST_BLOCK_TYPE_ID, PS_BLOCK_TYPE_ID, RISING_HEAD_PERMEABILITY_TEST_BLOCK_TYPE_ID, SPT_BLOCK_TYPE_ID, UD_BLOCK_TYPE_ID, VANE_SHEAR_TEST_BLOCK_TYPE_ID, WASH_BORING_BLOCK_TYPE_ID } from '@/interfaces/Block';
import { Borehole } from '@/interfaces/Borehole';
import { Project } from '@/interfaces/Project';
import { generateBorelogPdfAndroid } from '@/utils/pdf/generateBorelogPdfAndroid';
import { generateBorelogPdfIos } from '@/utils/pdf/generateBorelogPdfIos';
import { SQLiteDatabase, useSQLiteContext } from 'expo-sqlite';
import { deleteBlockByBlockIdDbAsync } from '@/db/blocks/deleteBlockByBlockIdDbAsync';

export default function BoreholeScreen() {
  const db: SQLiteDatabase = useSQLiteContext();
	const { id, projectTitle, name } = useLocalSearchParams();
  if (typeof id != 'string' || typeof projectTitle != 'string' || typeof name != 'string') {
    throw new Error(`Error. id: ${id}, projectTitle: ${projectTitle}, name: ${name}`);
  }
  const boreholeId: number = parseInt(id, 10);
  const boreholeName: string = name;
  const [project, setProject] = useState<Project | null>(null);
  const [borehole, setBorehole] = useState<Borehole | null>(null);
  const [isAddNewBlockButtonPressed, setIsAddNewBlockButtonPressed] = useState<boolean>(false);
  const [blocks, setBlocks] = useState<Block[]>([]);

  useEffect(() => {
    const init = async () => {
      const borehole: Borehole | null = await fetchBoreholeByIdAsync(db, boreholeId);
      const project: Project | null = await fetchProjectByIdAsync(db, borehole.projectId);
      const blocks: Block[] = await fetchAllBlocksByBoreholeIdDbAsync(db, boreholeId);
      setBorehole(borehole);
      setProject(project);
      setBlocks(blocks);
    };

    init();
  }, [boreholeId]);

  if (!borehole || !project) {
    return (
      <View>
        <Text>Loading...</Text>
      </View>
    );
  }

  const removeLastBlock = async () => {
    if (blocks.length === 0) {
      return;
    }
    const lastBlock: Block = blocks[blocks.length - 1];
    await deleteBlockByBlockIdDbAsync(db, lastBlock.blockId);
    setBlocks((blocks: Block[]) => blocks.filter((b: Block) => b.blockId !== lastBlock.blockId));
  };

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
          <AddNewBlockDetailsInputForm
            blocks={blocks}
            setBlocks={setBlocks}
            boreholeId={boreholeId}
            setIsAddNewBlockButtonPressed={setIsAddNewBlockButtonPressed}
          />
        )
      }
      <Button
        title='Remove Last Block'
        onPress={removeLastBlock}
      />
      <Button
        title='Share'
        onPress={async () => {
          try {
            const sortedBlocks: Block[] = [...blocks].sort((a: Block, b: Block) => a.topDepthInMetres - b.topDepthInMetres);
            const html = (Platform.OS === 'ios') ? await generateBorelogPdfIos(project, borehole, sortedBlocks) : await generateBorelogPdfAndroid(project, borehole, sortedBlocks);
            const { uri } = await Print.printToFileAsync({
              html,
              base64: false,
            });

            const newFileUri = FileSystem.documentDirectory + `${projectTitle.toUpperCase()}-${boreholeName.toUpperCase()}.pdf`;
            await FileSystem.moveAsync({
              from: uri,
              to: newFileUri,
            });

            const isAvailable = await Sharing.isAvailableAsync();
            if (isAvailable) {
              await Sharing.shareAsync(newFileUri);
            } else {
              alert('Sharing is not available on this device');
            }
          } catch (error) {
            console.error("PDF generation or sharing failed:", error);
            alert("Error: " + error);
          }
        }}
      />
    </View>
  );



  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}>
        <Stack.Screen
          options={{
            title: `${(projectTitle.length < 10) ? projectTitle : projectTitle.slice(0, 10)}... / ${boreholeName.toUpperCase()}`,
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        />
        <FlatList
          data={blocks}
          keyExtractor={(block: Block) => block.id.toString()}
          renderItem={({ item }) => {
            switch (item.blockTypeId) {
            case SPT_BLOCK_TYPE_ID:
              return <SptBlockComponent block={item} blocks={blocks} setBlocks={setBlocks} />;
            case CORING_BLOCK_TYPE_ID:
              return <CoringBlockComponent block={item} blocks={blocks} setBlocks={setBlocks} />
            case CAVITY_BLOCK_TYPE_ID:
              return <CavityBlockComponent block={item} blocks={blocks} setBlocks={setBlocks} />
            case UD_BLOCK_TYPE_ID:
              return <UdBlockComponent block={item} blocks={blocks} setBlocks={setBlocks} />
            case MZ_BLOCK_TYPE_ID:
              return <MzBlockComponent block={item} blocks={blocks} setBlocks={setBlocks} />
            case PS_BLOCK_TYPE_ID:
              return <PsBlockComponent block={item} blocks={blocks} setBlocks={setBlocks} />
            case HA_BLOCK_TYPE_ID:
              return <HaBlockComponent block={item} blocks={blocks} setBlocks={setBlocks} />
            case WASH_BORING_BLOCK_TYPE_ID:
              return <WashBoringBlockComponent block={item} blocks={blocks} setBlocks={setBlocks} />
            case CONCRETE_SLAB_BLOCK_TYPE_ID:
              return <ConcreteSlabBlockComponent block={item} blocks={blocks} setBlocks={setBlocks} />
            case ASPHALT_BLOCK_TYPE_ID:
              return <AsphaltBlockComponent block={item} blocks={blocks} setBlocks={setBlocks} />
            case END_OF_BOREHOLE_BLOCK_TYPE_ID:
              return <EndOfBoreholeBlockComponent block={item} blocks={blocks} setBlocks={setBlocks} />
            case CUSTOM_BLOCK_TYPE_ID:
              return <CustomBlockComponent block={item} blocks={blocks} setBlocks={setBlocks} />
            case VANE_SHEAR_TEST_BLOCK_TYPE_ID:
              return <VaneShearTestBlockComponent block={item} blocks={blocks} setBlocks={setBlocks} />
            case FALLING_HEAD_PERMEABILITY_TEST_BLOCK_TYPE_ID:
              return <FallingHeadPermeabilityTestBlockComponent block={item} blocks={blocks} setBlocks={setBlocks} />
            case RISING_HEAD_PERMEABILITY_TEST_BLOCK_TYPE_ID:
              return <RisingHeadPermeabilityTestBlockComponent block={item} blocks={blocks} setBlocks={setBlocks} />
            case CONSTANT_HEAD_PERMEABILITY_TEST_BLOCK_TYPE_ID:
              return <ConstantHeadPermeabilityTestBlockComponent block={item} blocks={blocks} setBlocks={setBlocks} />
            case LUGEON_TEST_BLOCK_TYPE_ID:
              return <LugeonTestBlockComponent block={item} blocks={blocks} setBlocks={setBlocks} />
            case PRESSUREMETER_TEST_BLOCK_TYPE_ID:
              return <PressuremeterTestBlockComponent block={item} blocks={blocks} setBlocks={setBlocks} />
            default:
              throw new Error('Unknown block type');
            }
          }}
          keyboardShouldPersistTaps="handled"
          ListFooterComponent={renderFooter}
          contentContainerStyle={{ paddingBottom: 500 }}
          style={{ width: '100%' }}
        />
      </KeyboardAvoidingView>
    </GestureHandlerRootView>
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
