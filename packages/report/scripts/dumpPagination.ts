/**
 * Prints the pagination result for every fixture as stable text.
 *
 * This is the project's test harness. There is no test runner in this repo and the plan
 * does not introduce one; instead the output is committed and `git diff` is the assertion.
 * Because paginate() is pure and platform-free, this needs neither a device nor a PDF —
 * it is the fastest feedback loop available for the part where the real thinking is.
 *
 *   pnpm --filter @mmsb/report pagination        # print
 *   pnpm --filter @mmsb/report pagination:snap   # rewrite the snapshot
 */
import { FIXTURES } from '../fixtures/builders.ts';
import { paginate, type PlacedRow } from '../src/layout/paginate.ts';
import { TICKS_PER_PAGE } from '../src/layout/constants.ts';

function describeRow(row: PlacedRow): string {
	const span = `${String(row.startTick).padStart(3)}..${String(row.startTick + row.tickCount).padEnd(3)}`;
	const metres = `${(row.startTick / 10).toFixed(1)}-${((row.startTick + row.tickCount) / 10).toFixed(1)}m`;
	if (row.kind === 'empty') {
		return `    ${span} ${String(row.tickCount).padStart(3)}t  ${metres.padEnd(14)} (filler, geometry of type ${row.referenceBlockTypeId})`;
	}
	const folded = row.testBlock === null ? '' : ` + folded ${row.testBlock.id}`;
	// A whole block prints nothing; a split one prints which part this is and whether the
	// interval carries on to the next page, since that is what decides the row's contents.
	const part =
		row.partIndex === 0 && row.isFinalPart
			? ''
			: ` [part ${row.partIndex}${row.isFinalPart ? ', last' : ', continues'}]`;
	return `    ${span} ${String(row.tickCount).padStart(3)}t  ${metres.padEnd(14)} ${row.block.id} (type ${row.block.blockTypeId})${folded}${part}`;
}

const lines: string[] = [];

for (const [name, blocks] of Object.entries(FIXTURES)) {
	const { pages, warnings } = paginate(blocks);
	lines.push(`${'='.repeat(78)}`);
	lines.push(`${name}  —  ${blocks.length} block(s) in, ${pages.length} page(s) out`);
	lines.push(`${'='.repeat(78)}`);

	for (const page of pages) {
		const total = page.rows.reduce((sum, row) => sum + row.tickCount, 0);
		// Every page must account for exactly 90 ticks or the ruler and the rows have drifted.
		const balance = total === TICKS_PER_PAGE ? 'ok' : `*** ${total} TICKS, EXPECTED ${TICKS_PER_PAGE} ***`;
		lines.push(`  page ${page.pageNumber} (from tick ${page.startTick}) — ${page.rows.length} rows, ${total} ticks [${balance}]`);
		for (const row of page.rows) {
			lines.push(describeRow(row));
		}
	}

	if (warnings.length > 0) {
		lines.push(`  warnings:`);
		for (const warning of warnings) {
			lines.push(`    ${JSON.stringify(warning)}`);
		}
	}
	lines.push('');
}

const output = lines.join('\n');

if (process.argv.includes('--snap')) {
	const { writeFileSync } = await import('node:fs');
	const { fileURLToPath } = await import('node:url');
	const { dirname, resolve } = await import('node:path');
	const target = resolve(dirname(fileURLToPath(import.meta.url)), '../fixtures/pagination.snapshot.txt');
	writeFileSync(target, output);
	console.log(`wrote ${target}`);
} else {
	console.log(output);
}
