import * as FileSystem from 'expo-file-system';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Platform } from "react-native";

import { Block } from "@/interfaces/Block";
import { generateBorelogPdfIos } from "./generateBorelogPdfIos";
import { generateBorelogPdfAndroid } from './generateBorelogPdfAndroid';
import { Project } from '@/interfaces/Project';
import { Borehole } from '@/interfaces/Borehole';

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
}