/**
 * Fills the AGS template from a fixture and writes the workbook to disk.
 *
 *   pnpm --filter @mmsb/ags-excel fill [output-path]
 *
 * The first end-to-end run of the whole path: blocks -> rows -> cells -> patched zip. Pair
 * it with scripts/verify.py, which reads the result back the way the report's Python does.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { FIXTURE_BLOCKS, FIXTURE_BOREHOLE } from '../fixtures/borehole.ts';
import { fillAgsWorkbook } from '../src/fillAgsWorkbook.ts';

const here = dirname(fileURLToPath(import.meta.url));
const templatePath = resolve(here, '../../../apps/web/public/ags/template.xlsx');
const outputPath = process.argv[2] ?? resolve(here, '../out/fixture.xlsx');

const template = new Uint8Array(readFileSync(templatePath));

const bytes = fillAgsWorkbook(template, {
	project: {
		code: 'MM1361',
		title: 'Proposed Development At Lot 1234',
		location: 'Kuala Lumpur',
		client: 'Example Client Sdn Bhd',
		consultant: 'Example Consultant Sdn Bhd',
	},
	boreholes: [{ borehole: FIXTURE_BOREHOLE, blocks: FIXTURE_BLOCKS }],
});

writeFileSync(outputPath, bytes);
console.log(`template ${template.byteLength} bytes -> ${outputPath} ${bytes.byteLength} bytes`);
