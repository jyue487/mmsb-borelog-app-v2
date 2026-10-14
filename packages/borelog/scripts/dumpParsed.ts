/**
 * Prints what the parsers read from each workbook, in the Python program's own field
 * names, so it can be diffed against the Python parsers' output.
 *
 *   node --import ./scripts/register.mjs scripts/dumpParsed.ts <xlsx>...
 */
import { readFileSync } from 'node:fs';
import { basename } from 'node:path';

import { parseBorelogWorkbook } from '../src/parse/parseBorelogWorkbook.ts';

const snake = (key: string) => key.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);
const toSnake = (value: unknown): unknown =>
	Array.isArray(value)
		? value.map(toSnake)
		: value !== null && typeof value === 'object'
			? Object.fromEntries(Object.entries(value).map(([k, v]) => [snake(k), toSnake(v)]))
			: value;

const out: Record<string, unknown> = {};
for (const path of process.argv.slice(2)) {
	const workbook = parseBorelogWorkbook(new Uint8Array(readFileSync(path)));
	const data = workbook.borelogData(workbook.boreholes[0].id);
	// Not a field the Python parsers have: it is what the port reads in place of their fixed 50.
	const { sptNMax: _, ...project } = data.project;
	out[basename(path)] = toSnake({ ...data, project });
}
console.log(JSON.stringify(out));
