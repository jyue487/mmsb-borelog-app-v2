import { strFromU8, strToU8, unzipSync, zipSync } from 'fflate';

import { patchSheetXml, type SheetPatch } from './cells';

/**
 * Applies per-sheet patches to a copy of the AGS template, leaving everything else alone.
 *
 * An .xlsx is a zip of XML parts. Rather than parse the workbook into an object model and
 * write it back — which would re-serialise 120,310 shared formulas, two sheets' data
 * validation, VML comment drawings and seven printerSettings blobs, dropping whatever the
 * library does not model — this rewrites only the worksheet parts it injects into and
 * copies every other entry through untouched. The template's formulas *are* the program
 * the report depends on, so "leave it exactly as it was" is the whole requirement.
 */

const WORKBOOK_PART = 'xl/workbook.xml';
const WORKBOOK_RELS_PART = 'xl/_rels/workbook.xml.rels';

/** Resolves worksheet display names to their part paths, via workbook.xml and its rels. */
function resolveSheetParts(files: Record<string, Uint8Array>): Map<string, string> {
	const workbookXml = strFromU8(requirePart(files, WORKBOOK_PART));
	const relsXml = strFromU8(requirePart(files, WORKBOOK_RELS_PART));

	const targetByRelId = new Map<string, string>();
	for (const match of relsXml.matchAll(/<Relationship\b[^>]*>/g)) {
		const id = /Id="([^"]+)"/.exec(match[0])?.[1];
		const target = /Target="([^"]+)"/.exec(match[0])?.[1];
		if (id !== undefined && target !== undefined) {
			// Targets are relative to xl/, and may or may not be written absolutely.
			targetByRelId.set(id, `xl/${target.replace(/^\/?xl\//, '').replace(/^\//, '')}`);
		}
	}

	const partBySheetName = new Map<string, string>();
	for (const match of workbookXml.matchAll(/<sheet\b[^>]*>/g)) {
		const name = /name="([^"]+)"/.exec(match[0])?.[1];
		const relId = /r:id="([^"]+)"/.exec(match[0])?.[1];
		const target = relId === undefined ? undefined : targetByRelId.get(relId);
		if (name !== undefined && target !== undefined) {
			// Trimmed: hand-made workbooks in the wild carry names like `'SPT - AGS '`.
			// Our own output never does, but matching leniently costs nothing.
			partBySheetName.set(name.trim(), target);
		}
	}

	return partBySheetName;
}

function requirePart(files: Record<string, Uint8Array>, part: string): Uint8Array {
	const bytes = files[part];
	if (bytes === undefined) {
		throw new Error(`The template is missing ${part}; it does not look like the AGS workbook.`);
	}
	return bytes;
}

/**
 * Makes Excel recalculate on open.
 *
 * Belt and braces: every cell the report reads gets a correct cached value written
 * explicitly, so the file is already right for a consumer that does not evaluate formulas.
 * This covers the cells nothing reads today, and any a future parser starts reading.
 */
function forceRecalculationOnLoad(workbookXml: string): string {
	if (/<calcPr\b[^>]*fullCalcOnLoad="1"/.test(workbookXml)) {
		return workbookXml;
	}
	return workbookXml.replace(/<calcPr\b/, '<calcPr fullCalcOnLoad="1"');
}

export function patchWorkbook(
	templateBytes: Uint8Array,
	patchesBySheetName: ReadonlyMap<string, SheetPatch>,
): Uint8Array {
	const files = unzipSync(templateBytes);
	const partBySheetName = resolveSheetParts(files);

	for (const [sheetName, patch] of patchesBySheetName) {
		const part = partBySheetName.get(sheetName.trim());
		if (part === undefined) {
			throw new Error(
				`The template has no sheet named "${sheetName}". Found: ${[...partBySheetName.keys()].join(', ')}`,
			);
		}
		files[part] = strToU8(patchSheetXml(strFromU8(requirePart(files, part)), patch));
	}

	files[WORKBOOK_PART] = strToU8(forceRecalculationOnLoad(strFromU8(requirePart(files, WORKBOOK_PART))));

	// xl/calcChain.xml is deliberately left in place. It records the *order* Excel
	// evaluates formulas in, not their cached results, and this patch neither adds nor
	// removes a formula — so it stays consistent. Deleting it would also orphan its
	// relationship in workbook.xml.rels and its [Content_Types].xml override, which is
	// exactly the kind of dangling reference that makes Excel offer to "repair" a file.
	// `fullCalcOnLoad` already guarantees a clean recalculation.
	return zipSync(files);
}
