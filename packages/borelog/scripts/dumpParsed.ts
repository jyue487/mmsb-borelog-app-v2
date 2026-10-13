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
	out[basename(path)] = toSnake(workbook.borelogData(workbook.boreholes[0].id));
}
console.log(JSON.stringify(out));
