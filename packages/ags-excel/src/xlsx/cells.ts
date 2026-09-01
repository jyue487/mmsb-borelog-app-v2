/**
 * Splicing values into the AGS template's worksheet XML.
 *
 * The template pre-declares every input cell as an empty, styled element —
 * `<c r="B7" s="54"/>` — on every usable row. So filling one means giving an element that
 * already exists a value, never inserting an element in column order and never inventing a
 * style. That is what keeps the patch surgical.
 *
 * `formulaCache` is the load-bearing case. The Python consumer reads the workbook with
 * `openpyxl.load_workbook(data_only=True)`, and openpyxl never evaluates formulas — it
 * returns the `<v>` cache Excel last wrote. The blank template's caches are stale (SPT's
 * "Reported Result" caches the literal string `0 (,)`), so a workbook filled without
 * touching them reports an N value of 0 on every row. Writing a correct cache *beside* the
 * untouched `<f>` satisfies openpyxl now and Excel's own recalculation later.
 */

export type CellValue =
	| { readonly kind: 'number'; readonly value: number }
	| { readonly kind: 'text'; readonly value: string }
	/** Overwrite a formula cell's cached result, leaving its `<f>` exactly as the template has it. */
	| { readonly kind: 'formulaCache'; readonly value: number | string };

export const numberCell = (value: number): CellValue => ({ kind: 'number', value });
export const textCell = (value: string): CellValue => ({ kind: 'text', value });
export const cacheCell = (value: number | string): CellValue => ({ kind: 'formulaCache', value });

/** Column letter -> value, for one row. */
export type RowPatch = ReadonlyMap<string, CellValue>;
/** Row number -> that row's cells. */
export type SheetPatch = ReadonlyMap<number, RowPatch>;

function escapeXml(value: string): string {
	return value
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;');
}

/** Sets or removes the `t` (cell type) attribute on a `<c ...>` open tag. */
function withType(openTag: string, type: string | null): string {
	const stripped = openTag.replace(/\s+t="[^"]*"/, '');
	if (type === null) {
		return stripped;
	}
	return `${stripped.slice(0, -1)} t="${type}">`;
}

function setCell(rowXml: string, ref: string, value: CellValue): string {
	const marker = `<c r="${ref}"`;
	const start = rowXml.indexOf(marker);
	if (start === -1) {
		throw new Error(
			`The template has no cell ${ref}. Every input cell is expected to exist as an empty ` +
				`styled element; a missing one means the row is past the template's usable range.`,
		);
	}

	const openEnd = rowXml.indexOf('>', start);
	const isSelfClosing = rowXml[openEnd - 1] === '/';

	let openTag: string;
	let body: string;
	let end: number;

	if (isSelfClosing) {
		openTag = `${rowXml.slice(start, openEnd - 1)}>`;
		body = '';
		end = openEnd + 1;
	} else {
		openTag = rowXml.slice(start, openEnd + 1);
		const close = rowXml.indexOf('</c>', openEnd);
		body = rowXml.slice(openEnd + 1, close);
		end = close + '</c>'.length;
	}

	let replacement: string;

	switch (value.kind) {
		case 'number': {
			replacement = `${withType(openTag, null)}<v>${value.value}</v></c>`;
			break;
		}
		case 'text': {
			// `xml:space="preserve"` only when it matters, to keep the diff against the
			// template as small as it can be.
			const needsSpace = value.value !== value.value.trim();
			const t = needsSpace ? '<t xml:space="preserve">' : '<t>';
			replacement = `${withType(openTag, 'inlineStr')}<is>${t}${escapeXml(value.value)}</t></is></c>`;
			break;
		}
		case 'formulaCache': {
			// Keep <f> byte-for-byte — including shared-formula masters, whose `ref`/`si`
			// attributes the rest of the column depends on. Only the cached <v> changes.
			const formula = body.replace(/<v[^>]*\/>|<v[^>]*>[\s\S]*?<\/v>/g, '');
			const isText = typeof value.value === 'string';
			const cached = isText ? escapeXml(value.value as string) : String(value.value);
			replacement = `${withType(openTag, isText ? 'str' : null)}${formula}<v>${cached}</v></c>`;
			break;
		}
	}

	return rowXml.slice(0, start) + replacement + rowXml.slice(end);
}

/**
 * Applies a patch to one worksheet part, in a single left-to-right pass.
 *
 * Rows are visited in ascending order behind a moving cursor rather than searched for
 * individually: the SPT sheet is 9.2 MB of XML, and an `indexOf` per cell over the whole
 * string would be quadratic.
 */
export function patchSheetXml(xml: string, patch: SheetPatch): string {
	if (patch.size === 0) {
		return xml;
	}

	const rowNumbers = [...patch.keys()].sort((a, b) => a - b);
	const pieces: string[] = [];
	let cursor = 0;

	for (const rowNumber of rowNumbers) {
		const marker = `<row r="${rowNumber}"`;
		const start = xml.indexOf(marker, cursor);
		if (start === -1) {
			throw new Error(`The template has no row ${rowNumber} on this sheet.`);
		}

		const close = xml.indexOf('</row>', start);
		if (close === -1) {
			throw new Error(`Row ${rowNumber} is empty in the template, so it has no cells to fill.`);
		}
		const rowEnd = close + '</row>'.length;

		let rowXml = xml.slice(start, rowEnd);
		for (const [column, value] of patch.get(rowNumber)!) {
			rowXml = setCell(rowXml, `${column}${rowNumber}`, value);
		}

		pieces.push(xml.slice(cursor, start), rowXml);
		cursor = rowEnd;
	}

	pieces.push(xml.slice(cursor));
	return pieces.join('');
}
