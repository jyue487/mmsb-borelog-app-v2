/**
 * Renders a fixture borehole to a real PDF.
 *
 *   pnpm --filter @mmsb/report render [fixture-name]
 *
 * This is the first end-to-end run of the whole pipeline: paginate → rows → DrawNodes →
 * pdf-lib. Output goes to spike/out-<fixture>.pdf for visual comparison.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PDFDocument } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';

import { FIXTURES } from '../fixtures/builders.ts';
import { buildReportDoc } from '../src/build/buildReportDoc.ts';
import { createPdfLibMeasurer } from '../src/render/pdfLibMeasurer.ts';
import { renderReportDoc } from '../src/render/pdfLibBackend.ts';
import { createPageGeometry } from '../src/layout/pageGeometry.ts';

const here = dirname(fileURLToPath(import.meta.url));
const assets = resolve(here, '../assets');
const read = (name: string) => new Uint8Array(readFileSync(resolve(assets, name)));

const fixtureName = process.argv.find((arg) => arg in FIXTURES) ?? 'single-page';
const blocks = FIXTURES[fixtureName];

// The measurer needs embedded fonts, and embedding needs a document — so a scratch document
// is used to build the measurer, then the real render embeds into its own.
const scratch = await PDFDocument.create();
scratch.registerFontkit(fontkit);
const measurer = createPdfLibMeasurer({
	regular: await scratch.embedFont(read('NotoSans-Regular.ttf'), { subset: false }),
	bold: await scratch.embedFont(read('NotoSans-Bold.ttf'), { subset: false }),
	italic: await scratch.embedFont(read('NotoSans-Italic.ttf'), { subset: false }),
});

const doc = buildReportDoc(
	{
		project: {
			title: 'Proposed Mixed Development at Jalan Ampang',
			location: 'Kuala Lumpur, Wilayah Persekutuan',
			client: 'MMSB Development Sdn Bhd',
			consultant: 'Geotechnical Consultants Sdn Bhd',
		},
		borehole: {
			id: 'fixture-borehole',
			projectId: 'fixture-project',
			name: 'BH-01',
			typeOfBoring: 'Rotary Wash Boring',
			typeOfRig: 'Soilmec SM-401',
			diameterOfBoring: '100mm',
			eastingInMetres: 456789.123,
			northingInMetres: 345678.456,
			reducedLevelInMetres: 32.145,
			drillerName: 'Ahmad bin Ismail',
			checkerName: 'Nur Aisyah binti Rahman',
			checkerSignatureBase64: '',
			checkerSignDate: new Date(0),
			verifierName: 'Lim Wei Ming',
			verifierSignatureBase64: '',
			verifierSignDate: new Date(0),
		},
		blocks,
	},
	measurer,
);

const bytes = await renderReportDoc(doc, {
	fontRegular: read('NotoSans-Regular.ttf'),
	fontBold: read('NotoSans-Bold.ttf'),
	fontItalic: read('NotoSans-Italic.ttf'),
	logoPng: read('mmsb-logo.png'),
	checkerSignature: null,
	verifierSignature: null,
});

const out = resolve(here, `../spike/out-${fixtureName}.pdf`);
writeFileSync(out, bytes);

const geometry = createPageGeometry();
console.log(`fixture      ${fixtureName} (${blocks.length} blocks)`);
console.log(`pages        ${doc.pages.length}`);
console.log(`nodes/page   ${doc.pages.map((p) => p.nodes.length).join(', ')}`);
console.log(`tick pitch   ${geometry.tickPitchPt.toFixed(4)}pt  (body ${geometry.bodyHeightPt.toFixed(2)}pt)`);
console.log(`size         ${(bytes.byteLength / 1024).toFixed(1)} KB`);
console.log(`sha256       ${createHash('sha256').update(bytes).digest('hex')}`);
console.log(`warnings     ${doc.warnings.length === 0 ? 'none' : JSON.stringify(doc.warnings)}`);
console.log(`output       ${out}`);
