import { buildWorkbookRows } from './map/buildWorkbookRows';
import type { AgsExcelInput } from './model/input';
import { patchWorkbook } from './xlsx/patchWorkbook';
import { buildSheetPatches } from './xlsx/writeRows';

/**
 * Fills a copy of the AGS template from borehole data and returns the new workbook's bytes.
 *
 * Platform-free by design, the same contract `@mmsb/report` keeps: no `expo-*`, no
 * `react-native`, no DOM, no `fs`, no `fetch`. The host supplies the template's bytes and
 * gets bytes back, so the whole path runs and is checkable in Node with no browser.
 *
 * The template is patched, never regenerated. Its worksheet formulas are the program that
 * turns typed input into the AGS output the report reads, so everything this does not
 * explicitly write is copied through byte for byte.
 */
export function fillAgsWorkbook(templateBytes: Uint8Array, input: AgsExcelInput): Uint8Array {
	return patchWorkbook(templateBytes, buildSheetPatches(buildWorkbookRows(input)));
}
