/**
 * Renders the borelog of every borehole in a workbook, in Node.
 *
 *   pnpm --filter @mmsb/borelog render <xlsx> [out-dir] [--python]
 *
 * Writes `<out-dir>/<workbook name> - <hole id>.pdf` per hole; holes that cannot be drawn
 * are reported and skipped. With `--python`, does what the Python program did instead —
 * only the hole on the first row of `Holes - AGS`, as `<workbook name>.pdf` — so the two
 * outputs line up file for file (scripts/compare.sh).
 */
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, dirname, extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { parseBorelogWorkbook } from '../src/parse/parseBorelogWorkbook.ts';
import { legendCodesFor, renderBorelog } from '../src/renderBorelog.ts';

const here = dirname(fileURLToPath(import.meta.url));
const assetsDir = resolve(here, '../assets');
const args = process.argv.slice(2);
const pythonMode = args.includes('--python');
const [input, outDir = resolve(here, '../out')] = args.filter((arg) => arg !== '--python');
if (input === undefined) {
	console.error('usage: render <xlsx> [out-dir]');
	process.exit(1);
}

const legendFiles = new Set(readdirSync(join(assetsDir, 'legends')));
const workbook = parseBorelogWorkbook(new Uint8Array(readFileSync(input)));
const stem = basename(input, extname(input));
mkdirSync(outDir, { recursive: true });

for (const hole of pythonMode ? workbook.boreholes.slice(0, 1) : workbook.boreholes) {
	try {
		const data = workbook.borelogData(hole.id);
		const legends = new Map<string, Uint8Array>();
		for (const code of [...legendCodesFor(data), '999']) {
			if (legendFiles.has(`${code}.png`)) legends.set(code, new Uint8Array(readFileSync(join(assetsDir, 'legends', `${code}.png`))));
		}
		const bytes = await renderBorelog(data, {
			companyLogo: new Uint8Array(readFileSync(join(assetsDir, 'company_logo.png'))),
			footerLogo: new Uint8Array(readFileSync(join(assetsDir, 'footer_logo.png'))),
			legends,
		});
		const name = pythonMode ? `${stem}.pdf` : `${stem} - ${hole.id}.pdf`;
		writeFileSync(join(outDir, name), bytes);
		console.log(`${hole.id}: ${bytes.byteLength} bytes -> ${join(outDir, name)}`);
	} catch (error) {
		console.log(`${hole.id}: skipped (${(error as Error).message})`);
	}
}
