/**
 * LEGACY — the pre-2026-08 HTML + expo-print pipeline, kept as a fallback while the pdf-lib
 * renderer in `packages/report` is validated against real boreholes.
 *
 * Not referenced by the app. To fall back, import `sharePdfLegacyHtml` instead of `sharePdf`
 * in `apps/mobile/src/app/borehole/[id].tsx` (note it returns void, so drop the `warnings`
 * handling at the call site).
 *
 * Known problems this path has and the new one does not: no embedded font on iOS, different
 * base font size per platform, text-autosizing left on for iOS, an A4 content box printed
 * onto a Letter page, and description sizing guessed from `description.length` — which
 * overflows the row and desynchronises the depth ruler. Delete once the new path is proven.
 */
import * as FileSystem from 'expo-file-system/legacy';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Platform } from "react-native";

import { Block, Borehole } from '@mmsb/core';
import { Project } from '@/src/interfaces/Project';
import { generateBorelogPdfAndroid } from './generateBorelogPdfAndroid';
import { generateBorelogPdfIos } from "./generateBorelogPdfIos";
import { safeRenameFileAsync } from './safeRenameFileAsync';

export async function sharePdfLegacyHtml(project: Project, borehole: Borehole, blocks: Block[]) {
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