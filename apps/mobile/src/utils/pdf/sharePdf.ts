import * as FileSystem from 'expo-file-system/legacy';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Platform } from "react-native";

import { Block } from "@/src/interfaces/Block";
import { Borehole } from '@/src/interfaces/Borehole';
import { Project } from '@/src/interfaces/Project';
import { generateBorelogPdfAndroid } from './generateBorelogPdfAndroid';
import { generateBorelogPdfIos } from "./generateBorelogPdfIos";
import { safeRenameFileAsync } from './safeRenameFileAsync';

export async function sharePdf(project: Project, borehole: Borehole, blocks: Block[]) {
    try {
        const sortedBlocks: Block[] = [...blocks].sort((a: Block, b: Block) => a.topDepthInMetres - b.topDepthInMetres);
        const html = (
            (Platform.OS === 'ios') 
            ? await generateBorelogPdfIos(project, borehole, sortedBlocks) 
            : await generateBorelogPdfAndroid(project, borehole, sortedBlocks)
        );
        const { uri } = await Print.printToFileAsync({
            html,
            base64: false,
        });

        const projectTitle: string = project.title;
        const boreholeName: string = borehole.name;
        const newFileUri = FileSystem.documentDirectory + `${projectTitle.toUpperCase()}-${boreholeName.toUpperCase()}.pdf`;
        await safeRenameFileAsync(uri, newFileUri);
        // await FileSystem.copyAsync({
        //     from: uri,
        //     to: newFileUri,
        // });
        // await FileSystem.moveAsync({
        //     from: uri,
        //     to: newFileUri,
        // });

        const isAvailable = await Sharing.isAvailableAsync();
        if (isAvailable) {
            await Sharing.shareAsync(newFileUri);
            // await Sharing.shareAsync(uri);
        } else {
            alert('Sharing is not available on this device');
        }

        // optional: clean up the cache version
        // await FileSystem.deleteAsync(uri, { idempotent: true });

    } catch (error) {
        console.error("PDF generation or sharing failed:", error);
        alert("Error: " + error);

    }
}