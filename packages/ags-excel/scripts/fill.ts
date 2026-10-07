/**
 * Fills the AGS template from a fixture and writes the workbook to disk.
 *
 *   pnpm --filter @mmsb/ags-excel fill [output-path]
 *   AGS_PROJECT_CODE=<code> pnpm --filter @mmsb/ags-excel fill   # a project's own template
 *
 * The first end-to-end run of the whole path: blocks -> rows -> cells -> patched zip. Pair
 * it with scripts/verify.py, which reads the result back the way the report's Python does.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { FIXTURE_BLOCKS, FIXTURE_BOREHOLE } from '../fixtures/borehole.ts';
import { agsTemplateFileName } from '../src/agsTemplate.ts';
import { fillAgsWorkbook } from '../src/fillAgsWorkbook.ts';

const here = dirname(fileURLToPath(import.meta.url));
const outputPath = process.argv[2] ?? resolve(here, '../out/fixture.xlsx');
// The fixture project's code decides the template, exactly as the dashboard's does.
const projectCode = process.env.AGS_PROJECT_CODE ?? 'MM1361';
const templatePath = resolve(here, '../../../apps/dashboard/public/ags', agsTemplateFileName(projectCode));

const template = new Uint8Array(readFileSync(templatePath));

const bytes = fillAgsWorkbook(template, {
	project: {
		code: projectCode,
		title: 'Proposed Development At Lot 1234',
		location: 'Kuala Lumpur',
		client: 'Example Client Sdn Bhd',
		consultant: 'Example Consultant Sdn Bhd',
	},
	boreholes: [{ borehole: FIXTURE_BOREHOLE, blocks: FIXTURE_BLOCKS }],
});

writeFileSync(outputPath, bytes);
console.log(`${templatePath} ${template.byteLength} bytes -> ${outputPath} ${bytes.byteLength} bytes`);
