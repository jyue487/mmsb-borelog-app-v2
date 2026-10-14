/**
 * Fills the AGS template from a fixture and writes the workbook to disk.
 *
 *   pnpm --filter @mmsb/ags-excel fill [output-path]
 *   AGS_SPT_N_MAX=100 pnpm --filter @mmsb/ags-excel fill   # a 100-blow project
 *
 * The first end-to-end run of the whole path: blocks -> rows -> cells -> patched zip. Pair
 * it with scripts/verify.py, which reads the result back the way the report's Python does.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { parseSptNMax } from '@mmsb/core';

import { FIXTURE_BLOCKS, FIXTURE_BOREHOLE } from '../fixtures/borehole.ts';
import { AGS_TEMPLATE_FILE_NAME } from '../src/agsTemplate.ts';
import { fillAgsWorkbook } from '../src/fillAgsWorkbook.ts';

const here = dirname(fileURLToPath(import.meta.url));
const outputPath = process.argv[2] ?? resolve(here, '../out/fixture.xlsx');
const projectCode = process.env.AGS_PROJECT_CODE ?? 'MM1361';
// AGS_SPT_N_MAX=100 exercises the 100-blow formulas and caches.
const sptNMax = parseSptNMax(process.env.AGS_SPT_N_MAX ?? null);
const templatePath = resolve(here, '../../../apps/dashboard/public/ags', AGS_TEMPLATE_FILE_NAME);

const template = new Uint8Array(readFileSync(templatePath));

const bytes = fillAgsWorkbook(template, {
	project: {
		code: projectCode,
		title: 'Proposed Development At Lot 1234',
		location: 'Kuala Lumpur',
		client: 'Example Client Sdn Bhd',
		consultant: 'Example Consultant Sdn Bhd',
		sptNMax,
	},
	boreholes: [{ borehole: FIXTURE_BOREHOLE, blocks: FIXTURE_BLOCKS }],
});

writeFileSync(outputPath, bytes);
console.log(`${templatePath} ${template.byteLength} bytes -> ${outputPath} ${bytes.byteLength} bytes`);
