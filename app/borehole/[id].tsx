import * as FileSystem from 'expo-file-system';
import * as Print from 'expo-print';
import { Stack, useLocalSearchParams } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { useState } from 'react';
import { Button, FlatList, KeyboardAvoidingView, Platform, StyleSheet, View } from "react-native";

// Local Imports
import { CavityBlockComponent } from '@/components/blockComponents/CavityBlockComponent';
import { ConcretePremixBlockComponent } from '@/components/blockComponents/ConcretePremixBlockComponent';
import { ConcreteSlabBlockComponent } from '@/components/blockComponents/ConcreteSlabBlockComponent';
import { CoringBlockComponent } from '@/components/blockComponents/CoringBlockComponent';
import { HaBlockComponent } from '@/components/blockComponents/HaBlockComponent';
import { MzBlockComponent } from '@/components/blockComponents/MzBlockComponent';
import { PsBlockComponent } from '@/components/blockComponents/PsBlockComponent';
import { SptBlockComponent } from '@/components/blockComponents/SptBlockComponent';
import { UdBlockComponent } from '@/components/blockComponents/UdBlockComponent';
import { WashBoringBlockComponent } from '@/components/blockComponents/WashBoringBlockComponent';
import { AddNewBlockDetailsInputForm } from '@/components/blockDetailsInputForms/AddNewBlockDetailsInputForm';
import { Block, CAVITY_BLOCK_TYPE, CONCRETE_PREMIX_BLOCK_TYPE, CONCRETE_SLAB_BLOCK_TYPE, CORING_BLOCK_TYPE, HA_BLOCK_TYPE, MZ_BLOCK_TYPE, PS_BLOCK_TYPE, SPT_BLOCK_TYPE, UD_BLOCK_TYPE, WASH_BORING_BLOCK_TYPE } from '@/interfaces/Block';
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
        title='Remove Last BLock'
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
          title: `${projectName.toUpperCase()} / ${boreholeName.toUpperCase()}`,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      />
      <FlatList
        data={blocks}
        keyExtractor={(block: Block) => block.id.toString()}
        renderItem={({ item }) => {
          switch (item.blockType) {
          case SPT_BLOCK_TYPE:
            return <SptBlockComponent style={styles.block} block={item} blocks={blocks} setBlocks={setBlocks} />;
          case CORING_BLOCK_TYPE:
            return <CoringBlockComponent style={styles.block} block={item} blocks={blocks} setBlocks={setBlocks} />
          case CAVITY_BLOCK_TYPE:
            return <CavityBlockComponent style={styles.block} block={item} blocks={blocks} setBlocks={setBlocks} />
          case UD_BLOCK_TYPE:
            return <UdBlockComponent style={styles.block} block={item} blocks={blocks} setBlocks={setBlocks} />
          case MZ_BLOCK_TYPE:
            return <MzBlockComponent style={styles.block} block={item} blocks={blocks} setBlocks={setBlocks} />
          case PS_BLOCK_TYPE:
            return <PsBlockComponent style={styles.block} block={item} blocks={blocks} setBlocks={setBlocks} />
          case HA_BLOCK_TYPE:
            return <HaBlockComponent style={styles.block} block={item} blocks={blocks} setBlocks={setBlocks} />
          case WASH_BORING_BLOCK_TYPE:
            return <WashBoringBlockComponent style={styles.block} block={item} blocks={blocks} setBlocks={setBlocks} />
          case CONCRETE_SLAB_BLOCK_TYPE:
            return <ConcreteSlabBlockComponent style={styles.block} block={item} blocks={blocks} setBlocks={setBlocks} />
          case CONCRETE_PREMIX_BLOCK_TYPE:
            return <ConcretePremixBlockComponent style={styles.block} block={item} blocks={blocks} setBlocks={setBlocks} />
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
