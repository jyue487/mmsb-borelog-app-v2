/**
 * Renders borelogs from a workbook, in Node.
 *
 *   pnpm --filter @mmsb/borelog render <xlsx> [out-dir] [--holes BH1,BH3] [--python]
 *
 * Writes `<out-dir>/<workbook name> - <hole id>.pdf` for each hole drawn, and
 * `<workbook name> - <hole id>.error.txt` for each one that could not be — every hole on
 * `Holes - AGS`, or only those `--holes` names. This is what the dashboard's Borelog tab
 * zips up.
 *
 * With `--python`, does what the Python program did instead — only the hole on the first row
 * of `Holes - AGS`, as `<workbook name>.pdf`, on its fixed 0–50 SPT axis when D13 is blank —
 * so the two outputs line up file for file (scripts/compare.sh).
 */
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, dirname, extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { parseBorelogWorkbook, type BorelogWorkbook } from '../src/parse/parseBorelogWorkbook.ts';
import { borelogFileStem, renderBorelogs, type LoadBorelogAssets } from '../src/printBorelogs.ts';
import { FALLBACK_LEGEND_CODE } from '../src/renderBorelog.ts';

const here = dirname(fileURLToPath(import.meta.url));
const assetsDir = resolve(here, '../assets');

const args = process.argv.slice(2);
const pythonMode = args.includes('--python');
const holesIndex = args.indexOf('--holes');
const holesArg = holesIndex === -1 ? undefined : args[holesIndex + 1];
const isHolesFlag = (i: number) => holesIndex !== -1 && (i === holesIndex || i === holesIndex + 1);
const positional = args.filter((arg, i) => arg !== '--python' && !isHolesFlag(i));
const [input, outDir = resolve(here, '../out')] = positional;
if (input === undefined || (holesIndex !== -1 && holesArg === undefined)) {
	console.error('usage: render <xlsx> [out-dir] [--holes BH1,BH3] [--python]');
	process.exit(1);
}

const parsed = parseBorelogWorkbook(new Uint8Array(readFileSync(input)));
// The Python program had no SPT-N Max and drew every axis to 50.
const workbook: BorelogWorkbook =
	pythonMode && parsed.project.sptNMax === null
		? {
				...parsed,
				borelogData: (id) => {
					const data = parsed.borelogData(id);
					return { ...data, project: { ...data.project, sptNMax: 50 } };
				},
			}
		: parsed;

const legendFiles = new Set(readdirSync(join(assetsDir, 'legends')));
const readAsset = (path: string) => new Uint8Array(readFileSync(join(assetsDir, path)));
const loadAssets: LoadBorelogAssets = async (codes) => {
	const legends = new Map<string, Uint8Array>();
	for (const code of [...codes, FALLBACK_LEGEND_CODE]) {
		if (legendFiles.has(`${code}.png`)) legends.set(code, readAsset(join('legends', `${code}.png`)));
	}
	return { companyLogo: readAsset('company_logo.png'), footerLogo: readAsset('footer_logo.png'), legends };
};

const holeIds = pythonMode
	? workbook.boreholes.slice(0, 1).map((hole) => hole.id)
	: (holesArg?.split(',').map((id) => id.trim()) ?? workbook.boreholes.map((hole) => hole.id));
const stem = basename(input, extname(input));
mkdirSync(outDir, { recursive: true });

for (const result of await renderBorelogs(workbook, holeIds, loadAssets)) {
	const fileStem = pythonMode ? stem : borelogFileStem(stem, result.holeId);
	if ('pdf' in result) {
		writeFileSync(join(outDir, `${fileStem}.pdf`), result.pdf);
		console.log(`${result.holeId}: ${result.pdf.byteLength} bytes -> ${join(outDir, `${fileStem}.pdf`)}`);
	} else {
		writeFileSync(join(outDir, `${fileStem}.error.txt`), `${result.error}\n`);
		console.log(`${result.holeId}: failed (${result.error})`);
	}
}
