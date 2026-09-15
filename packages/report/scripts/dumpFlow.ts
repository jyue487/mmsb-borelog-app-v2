/**
 * Prints where every row's CONTENTS land, in points, for every fixture — the content layer's
 * counterpart to `dumpPagination.ts`, which prints the depth layer in ticks.
 *
 *   pnpm --filter @mmsb/report flow        # print
 *   pnpm --filter @mmsb/report flow:snap   # rewrite the snapshot
 *
 * Unlike pagination this needs a font, because a row's height comes from wrapping its
 * description; the real NotoSans metrics are used so the snapshot is the layout the PDF
 * gets. A row is printed with its box, its part number, how many description lines it
 * carries, and — the point of the layer — how far its contents were pushed below its depth
 * top. The separators follow: `straight` where nothing was pushed, otherwise the depth
 * position and the content position the three-segment line joins.
 */
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PDFDocument } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';

import { FIXTURES } from '../fixtures/builders.ts';
import { flowContent, type BodyPos, type ContentPart } from '../src/layout/flowContent.ts';
import { paginate } from '../src/layout/paginate.ts';
import { createPageGeometry } from '../src/layout/pageGeometry.ts';
import { createPdfLibMeasurer } from '../src/render/pdfLibMeasurer.ts';
import { measureRowContent } from '../src/rows/rowMetrics.ts';

const here = dirname(fileURLToPath(import.meta.url));
const assets = resolve(here, '../assets');
const read = (name: string) => new Uint8Array(readFileSync(resolve(assets, name)));

const scratch = await PDFDocument.create();
scratch.registerFontkit(fontkit);
const measurer = createPdfLibMeasurer({
	regular: await scratch.embedFont(read('NotoSans-Regular.ttf'), { subset: false }),
	bold: await scratch.embedFont(read('NotoSans-Bold.ttf'), { subset: false }),
	italic: await scratch.embedFont(read('NotoSans-Italic.ttf'), { subset: false }),
});
const geometry = createPageGeometry();

const pt = (value: number) => value.toFixed(2).padStart(7);
const at = (pos: BodyPos) => `p${pos.page + 1}@${pos.yPt.toFixed(2)}`;

function describePart(part: ContentPart): string {
	const span = `${pt(part.topPt)}..${pt(part.topPt + part.heightPt)}`;
	if (part.kind === 'empty') {
		return `    ${span}  (filler, geometry of type ${part.referenceBlockTypeId})`;
	}
	const folded = part.testBlock === null ? '' : ` + folded ${part.testBlock.id}`;
	const which =
		part.partIndex === 0 && part.isFinalPart ? '' : ` [part ${part.partIndex}${part.isFinalPart ? ', last' : ', continues'}]`;
	const lines = part.lines.length === 0 ? '' : `  ${part.lines.length} line${part.lines.length === 1 ? '' : 's'}`;
	return `    ${span}  ${part.block.id}${folded}${which}${lines}`;
}

const output: string[] = [];

for (const [name, blocks] of Object.entries(FIXTURES)) {
	const { pages: slices } = paginate(blocks);
	const flow = flowContent(slices, geometry, (block, testBlock) => measureRowContent(block, testBlock, geometry, measurer));

	output.push('='.repeat(78));
	output.push(`${name}  —  ${blocks.length} block(s) in, ${flow.pages.length} page(s) out (${slices.length} by depth)`);
	output.push('='.repeat(78));

	for (const page of flow.pages) {
		output.push(`  page ${page.pageNumber} (from tick ${page.startTick}) — ${page.parts.length} parts`);
		for (const part of page.parts) {
			output.push(describePart(part));
		}
	}

	const pushed = flow.separators.filter((s) => s.y1.page !== s.y2.page || Math.abs(s.y1.yPt - s.y2.yPt) > 1e-6);
	output.push(`  separators: ${flow.separators.length}, of which ${pushed.length} pushed`);
	for (const separator of pushed) {
		const byPt = (separator.y2.page - separator.y1.page) * geometry.bodyHeightPt + separator.y2.yPt - separator.y1.yPt;
		output.push(`    depth ${at(separator.y1)}  ->  contents ${at(separator.y2)}   (+${byPt.toFixed(2)}pt)`);
	}
	output.push('');
}

const text = output.join('\n');

if (process.argv.includes('--snap')) {
	const { writeFileSync } = await import('node:fs');
	const target = resolve(here, '../fixtures/flow.snapshot.txt');
	writeFileSync(target, text);
	console.log(`wrote ${target}`);
} else {
	console.log(text);
}
