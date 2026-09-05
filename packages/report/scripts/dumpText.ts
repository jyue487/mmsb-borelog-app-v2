/**
 * Exercises the text kernel with the real embedded font, and shows what the old
 * character-count formula would have chosen for the same input.
 *
 *   pnpm --filter @mmsb/report text
 *
 * The comparison column is the point of this script: the old formula never saw the column
 * width or the font, so it shrinks text that would have fitted and (on iOS) can pick a
 * non-positive size.
 */
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PDFDocument } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';

import { CONTENT_WIDTH_PT, COLUMN_FRACTIONS } from '../src/layout/constants.ts';
import { TICK_PITCH_PT } from '../src/layout/pageGeometry.ts';
import { createPdfLibMeasurer } from '../src/render/pdfLibMeasurer.ts';
import { fitTextAcrossBoxes, fitTextToBox } from '../src/text/fitTextToBox.ts';
import { parseRichText } from '../src/text/richText.ts';

const here = dirname(fileURLToPath(import.meta.url));
const assets = resolve(here, '../assets');

const doc = await PDFDocument.create();
doc.registerFontkit(fontkit);
const regular = await doc.embedFont(new Uint8Array(readFileSync(resolve(assets, 'NotoSans-Regular.ttf'))), { subset: false });
const bold = await doc.embedFont(new Uint8Array(readFileSync(resolve(assets, 'NotoSans-Bold.ttf'))), { subset: false });
const italic = await doc.embedFont(new Uint8Array(readFileSync(resolve(assets, 'NotoSans-Italic.ttf'))), { subset: false });
const measurer = createPdfLibMeasurer({ regular, bold, italic });

const DESCRIPTION_WIDTH_PT = CONTENT_WIDTH_PT * COLUMN_FRACTIONS[4];

// The pitch comes from pageGeometry, not from a number typed here. It used to be a local
// 505.198 left over from the spike, which is 22pt adrift of the real body band — precisely
// the ruler-vs-page-box drift the rewrite existed to stop.

/** apps/mobile/src/utils/pdf/renderDescriptionToHtml.ts:5-18, Android branch. */
function oldFormula(description: string, ticks: number): number {
	return Math.min(7, Math.max(3, Math.floor(11 - description.length / ticks / 10)));
}
/** The same file's iOS branch — no lower clamp. */
function oldFormulaIos(description: string, ticks: number): number {
	return Math.min(8, Math.floor(11 - description.length / ticks / 10));
}

const CASES: { label: string; ticks: number; description: string }[] = [
	{ label: 'short', ticks: 15, description: 'Firm silty CLAY' },
	{ label: 'typical', ticks: 15, description: 'Firm to stiff light grey mottled brown silty CLAY with occasional fine sand' },
	{ label: 'long in tall row', ticks: 40, description: 'Very dense light yellowish brown silty fine to coarse SAND with occasional subangular fine to medium gravel, becoming gravelly below 12.0m'.repeat(2) },
	{ label: 'long in short row', ticks: 5, description: 'Very dense light yellowish brown silty fine to coarse SAND with occasional subangular fine to medium gravel'.repeat(2) },
	{ label: 'extreme in tiny row', ticks: 2, description: 'X'.repeat(1200) },
	{ label: 'folded test (italic)', ticks: 20, description: 'Stiff brown sandy CLAY<br><i>Falling head permeability test, k = 3.2 x 10-6 m/s</i>' },
	{ label: 'eob remarks', ticks: 30, description: 'End of borehole at 30.0m<br><br>Remarks: Borehole terminated on client instruction after refusal in weathered granite.' },
	{ label: 'unbreakable token', ticks: 10, description: 'GRANITE_MODERATELY_WEATHERED_GRADE_III_TO_IV_VERY_STRONG_FRESH_JOINTED' },
];

console.log(`DESCRIPTION column: ${DESCRIPTION_WIDTH_PT.toFixed(2)}pt wide   tick pitch: ${TICK_PITCH_PT.toFixed(3)}pt\n`);
console.log(`${'case'.padEnd(22)} ${'ticks'.padStart(5)} ${'boxH'.padStart(7)} ${'new'.padStart(5)} ${'lines'.padStart(5)} ${'usedH'.padStart(7)}   ${'old(A)'.padStart(6)} ${'old(iOS)'.padStart(8)}  note`);
console.log('-'.repeat(104));

for (const testCase of CASES) {
	const boxHeightPt = testCase.ticks * TICK_PITCH_PT;
	const tokens = parseRichText(testCase.description);
	const fit = fitTextToBox(tokens, DESCRIPTION_WIDTH_PT, boxHeightPt, measurer);
	const usedHeight = fit.lines.length * fit.lineHeightPt;

	const oldA = oldFormula(testCase.description, testCase.ticks);
	const oldIos = oldFormulaIos(testCase.description, testCase.ticks);

	// What the old size would actually have done in this box. Too small wastes space; too
	// large overflows the row, and since the ruler's ticks are fixed height, an overflowing
	// description pushed the rows out of step with the depth scale for the rest of the page.
	const oldLayout = fitTextToBox(tokens, DESCRIPTION_WIDTH_PT, Number.POSITIVE_INFINITY, measurer, undefined, [oldA]);
	const oldHeight = oldLayout.lines.length * oldLayout.lineHeightPt;

	const notes: string[] = [];
	if (fit.overflowed) notes.push('CLIPPED + warning');
	if (oldIos <= 0) notes.push(`iOS: font-size:${oldIos} -> width:Infinity%`);
	if (oldHeight > boxHeightPt) {
		notes.push(`old ${oldA}pt OVERFLOWS by ${(oldHeight - boxHeightPt).toFixed(1)}pt -> ruler desync`);
	} else if (oldA < fit.sizePt) {
		notes.push(`old shrank to ${oldA}pt where ${fit.sizePt}pt fits`);
	}

	console.log(
		`${testCase.label.padEnd(22)} ${String(testCase.ticks).padStart(5)} ${boxHeightPt.toFixed(1).padStart(7)} ${String(fit.sizePt).padStart(5)} ${String(fit.lines.length).padStart(5)} ${usedHeight.toFixed(1).padStart(7)}   ${String(oldA).padStart(6)} ${String(oldIos).padStart(8)}  ${notes.join('; ')}`,
	);
}

console.log('\nwrapped output for "folded test (italic)":');
const folded = parseRichText(CASES[5].description);
const foldedFit = fitTextToBox(folded, DESCRIPTION_WIDTH_PT, CASES[5].ticks * TICK_PITCH_PT, measurer);
for (const [i, line] of foldedFit.lines.entries()) {
	const rendered = line.runs.map((run) => (run.fontId === 'regular' ? run.text : `[${run.fontId}]${run.text}`)).join('');
	console.log(`  ${String(i + 1).padStart(2)}. ${rendered}   (${line.widthPt.toFixed(1)}pt)`);
}

// --- the multi-box path: a block whose interval crosses a page break -----------------------
//
// The point of the check is that ONE size is chosen for the whole paragraph. Fitting each
// part on its own would set the 5-tick fragment at the bottom of a page smaller than the
// 30-tick continuation at the top of the next, and the same sentence would change size
// mid-word across the fold.

const SPLIT_CASES: { label: string; parts: number[]; description: string }[] = [
	{
		label: 'ordinary split 5t + 10t',
		parts: [5, 10],
		description: 'Firm to stiff light grey mottled brown silty CLAY with occasional fine sand and rootlets',
	},
	{
		label: 'coring run over 3 pages',
		parts: [85, 90, 20],
		description: 'Moderately weathered, moderately strong, grey GRANITE, closely to medium jointed with iron staining along joint surfaces'.repeat(3),
	},
	{
		label: 'first part too short to help',
		parts: [3, 40],
		description: 'Very dense light yellowish brown silty fine to coarse SAND with occasional subangular gravel'.repeat(2),
	},
];

console.log('\nsplit descriptions (one size across all parts):');
for (const splitCase of SPLIT_CASES) {
	const heights = splitCase.parts.map((ticks) => ticks * TICK_PITCH_PT);
	const tokens = parseRichText(splitCase.description);
	const fit = fitTextAcrossBoxes(tokens, DESCRIPTION_WIDTH_PT, heights, measurer);

	// Fitting each part alone is what we are NOT doing; show what it would have picked.
	const perPart = heights.map((h) => fitTextToBox(tokens, DESCRIPTION_WIDTH_PT, h, measurer).sizePt);
	const dropped = fit.overflowed ? '  CLIPPED + warning' : '';

	console.log(
		`  ${splitCase.label.padEnd(30)} ${String(fit.sizePt).padStart(4)}pt  lines per part [${fit.perBox.map((lines) => lines.length).join(', ')}]` +
			`  (fitted separately would pick ${perPart.join('/')}pt)${dropped}`,
	);
}
