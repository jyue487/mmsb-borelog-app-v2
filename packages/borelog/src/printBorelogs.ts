import { strToU8, zipSync } from 'fflate';

import type { BorelogWorkbook } from './parse/parseBorelogWorkbook';
import { legendCodesFor, renderBorelog, type BorelogAssets } from './renderBorelog';

/** One borehole's outcome: its borelog, or why it could not be drawn. */
export type BorelogResult =
	| { readonly holeId: string; readonly pdf: Uint8Array }
	| { readonly holeId: string; readonly error: string };

/**
 * Hands over the assets one borelog needs. `legendCodes` are the codes that hole's geology
 * uses (`legendCodesFor`); the host fetches those and `999`, and nothing else.
 */
export type LoadBorelogAssets = (legendCodes: readonly string[]) => Promise<BorelogAssets>;

/**
 * Draws the borelog of each named borehole in a workbook, in the order given.
 *
 * A borehole that fails — no progress rows, a sample/SPT mismatch — becomes an
 * `error` entry instead of stopping the others, which is what the Python program's
 * `<name>.error.txt` did per workbook.
 */
export async function renderBorelogs(
	workbook: BorelogWorkbook,
	holeIds: readonly string[],
	loadAssets: LoadBorelogAssets,
): Promise<BorelogResult[]> {
	const results: BorelogResult[] = [];
	for (const holeId of holeIds) {
		try {
			const data = workbook.borelogData(holeId);
			const pdf = await renderBorelog(data, await loadAssets(legendCodesFor(data)));
			results.push({ holeId, pdf });
		} catch (error) {
			results.push({ holeId, error: error instanceof Error ? error.message : String(error) });
		}
	}
	return results;
}

/** Characters no common file system accepts in a name, plus control characters. */
const UNSAFE_FILENAME_CHARACTERS = /[/\\:*?"<>|\u0000-\u001f]/g;

/** `<stem> - <hole id>`, the name both files of one borehole share. */
export function borelogFileStem(workbookStem: string, holeId: string): string {
	return `${workbookStem} - ${holeId}`.replace(UNSAFE_FILENAME_CHARACTERS, '_');
}

/**
 * Packs the results into one zip: `<stem> - <hole>.pdf` for each borelog drawn, and
 * `<stem> - <hole>.error.txt` holding the reason for each one that was not.
 */
export function zipBorelogs(results: readonly BorelogResult[], workbookStem: string): Uint8Array {
	const files: Record<string, Uint8Array> = {};
	for (const result of results) {
		const stem = borelogFileStem(workbookStem, result.holeId);
		if ('pdf' in result) {
			files[`${stem}.pdf`] = result.pdf;
		} else {
			files[`${stem}.error.txt`] = strToU8(`${result.error}\n`);
		}
	}
	return zipSync(files);
}
