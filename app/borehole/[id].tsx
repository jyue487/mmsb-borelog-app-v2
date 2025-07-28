import * as FileSystem from 'expo-file-system';
import * as Print from 'expo-print';
import { Stack, useLocalSearchParams } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { useState } from 'react';
import { Button, FlatList, KeyboardAvoidingView, Platform, StyleSheet } from "react-native";

// Local Imports
import { CavityBlockComponent } from '@/components/blockComponents/CavityBlockComponent';
import { ConcretePremixBlockComponent } from '@/components/blockComponents/ConcretePremixBlockComponent';
import { ConcreteSlabBlockComponent } from '@/components/blockComponents/ConcreteSlabBlockComponent';
import { CoringBlockComponent } from '@/components/blockComponents/CoringBlockComponent';
import { EndOfBoreholeBlockComponent } from '@/components/blockComponents/EndOfBoreholeBlockComponent copy';
import { HaBlockComponent } from '@/components/blockComponents/HaBlockComponent';
import { MzBlockComponent } from '@/components/blockComponents/MzBlockComponent';
import { PsBlockComponent } from '@/components/blockComponents/PsBlockComponent';
import { SptBlockComponent } from '@/components/blockComponents/SptBlockComponent';
import { UdBlockComponent } from '@/components/blockComponents/UdBlockComponent';
import { WashBoringBlockComponent } from '@/components/blockComponents/WashBoringBlockComponent';
import { AddNewBlockDetailsInputForm } from '@/components/blockDetailsInputForms/AddNewBlockDetailsInputForm';
import { Block, CAVITY_BLOCK_TYPE_ID, CONCRETE_PREMIX_BLOCK_TYPE_ID, CONCRETE_SLAB_BLOCK_TYPE_ID, CORING_BLOCK_TYPE_ID, END_OF_BOREHOLE_BLOCK_TYPE_ID, HA_BLOCK_TYPE_ID, MZ_BLOCK_TYPE_ID, PS_BLOCK_TYPE_ID, SPT_BLOCK_TYPE_ID, UD_BLOCK_TYPE_ID, WASH_BORING_BLOCK_TYPE_ID } from '@/interfaces/Block';
import { generateBorelogPdf } from '@/utils/pdf/generateBorelogPdf';

export default function BoreholeScreen() {
	const { id, projectName, name } = useLocalSearchParams();
  if (typeof id != 'string' || typeof projectName != 'string' || typeof name != 'string') {
    throw new Error(`Error. id: ${id}, projectName: ${projectName}, name: ${name}`);
  }
  const boreholeId: number = parseInt(id, 10);
  const boreholeName: string = name;
  const [isAddNewBlockButtonPressed, setIsAddNewBlockButtonPressed] = useState<boolean>(false);
  const [blocks, setBlocks] = useState<Block[]>([]);

  const removeLastBlock = async () => {
    setBlocks((blocks) => blocks.slice(0, -1));
  };

  const renderFooter = () => (
    <>
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
          const html = await generateBorelogPdf(blocks);
          const { uri } = await Print.printToFileAsync({
            html,
            base64: false,
          });

          const newFileUri = FileSystem.documentDirectory + `${projectName.toUpperCase()}-${boreholeName.toUpperCase()}.pdf`;
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
        }}
      />
    </>
  );



  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}>
      <Stack.Screen
        options={{
          title: `${(projectName.length < 10) ? projectName : projectName.slice(0, 10)}... / ${boreholeName.toUpperCase()}`,
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
            return <SptBlockComponent style={styles.block} block={item} blocks={blocks} setBlocks={setBlocks} />;
          case CORING_BLOCK_TYPE_ID:
            return <CoringBlockComponent style={styles.block} block={item} blocks={blocks} setBlocks={setBlocks} />
          case CAVITY_BLOCK_TYPE_ID:
            return <CavityBlockComponent style={styles.block} block={item} blocks={blocks} setBlocks={setBlocks} />
          case UD_BLOCK_TYPE_ID:
            return <UdBlockComponent style={styles.block} block={item} blocks={blocks} setBlocks={setBlocks} />
          case MZ_BLOCK_TYPE_ID:
            return <MzBlockComponent style={styles.block} block={item} blocks={blocks} setBlocks={setBlocks} />
          case PS_BLOCK_TYPE_ID:
            return <PsBlockComponent style={styles.block} block={item} blocks={blocks} setBlocks={setBlocks} />
          case HA_BLOCK_TYPE_ID:
            return <HaBlockComponent style={styles.block} block={item} blocks={blocks} setBlocks={setBlocks} />
          case WASH_BORING_BLOCK_TYPE_ID:
            return <WashBoringBlockComponent style={styles.block} block={item} blocks={blocks} setBlocks={setBlocks} />
          case CONCRETE_SLAB_BLOCK_TYPE_ID:
            return <ConcreteSlabBlockComponent style={styles.block} block={item} blocks={blocks} setBlocks={setBlocks} />
          case CONCRETE_PREMIX_BLOCK_TYPE_ID:
            return <ConcretePremixBlockComponent style={styles.block} block={item} blocks={blocks} setBlocks={setBlocks} />
          case END_OF_BOREHOLE_BLOCK_TYPE_ID:
            return <EndOfBoreholeBlockComponent style={styles.block} block={item} blocks={blocks} setBlocks={setBlocks} />
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
  block: {
    width: '100%',
    borderWidth: 1,
  },
  listItem: {
		borderLeftWidth: 0.25,
		borderRightWidth: 0.25,
		borderBottomWidth: 0.25,
		alignItems: 'center',
		padding: 10,
	}
});
