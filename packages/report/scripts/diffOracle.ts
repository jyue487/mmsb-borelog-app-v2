/**
 * Differential check: does the restructured paginate() place blocks where the old loop did?
 *
 *   pnpm --filter @mmsb/report oracle
 *
 * Any divergence is printed. A divergence is only acceptable if it is one of the bugs the
 * migration set out to fix (a runaway page loop, an unguarded empty borehole); anything
 * else means the restructuring changed behaviour and needs explaining.
 */
import { FIXTURES } from '../fixtures/builders.ts';
import { paginate } from '../src/layout/paginate.ts';
import { paginateOracle } from './referenceOracle.ts';

let divergent = 0;

for (const [name, blocks] of Object.entries(FIXTURES)) {
	// The old loop threw outright on an empty borehole, so there is nothing to compare.
	if (blocks.length === 0) {
		console.log(`${name.padEnd(26)} SKIPPED — old code threw here (blocks[length-1] unguarded)`);
		continue;
	}

	const oracle = paginateOracle(blocks);
	const mine = paginate(blocks);

	const mineRows = mine.pages.flatMap((page) =>
		page.rows.map((row) => ({
			label: row.kind === 'empty' ? '(filler)' : row.testBlock ? `${row.block.id}+${row.testBlock.id}` : row.block.id,
			startTick: row.startTick,
			tickCount: row.tickCount,
		})),
	);

	if (oracle.ranAway) {
		console.log(`${name.padEnd(26)} DIVERGES — old loop ran away (>200 pages); new one produced ${mine.pages.length} page(s) + ${mine.warnings.length} warning(s)`);
		divergent += 1;
		continue;
	}

	const a = JSON.stringify(oracle.rows);
	const b = JSON.stringify(mineRows);
	if (a === b) {
		console.log(`${name.padEnd(26)} match    (${mine.pages.length} page(s), ${mineRows.length} rows)`);
		continue;
	}

	divergent += 1;
	console.log(`${name.padEnd(26)} DIVERGES`);
	const max = Math.max(oracle.rows.length, mineRows.length);
	for (let i = 0; i < max; i++) {
		const o = oracle.rows[i];
		const m = mineRows[i];
		const os = o ? `${o.label}@${o.startTick}+${o.tickCount}` : '—';
		const ms = m ? `${m.label}@${m.startTick}+${m.tickCount}` : '—';
		if (os !== ms) {
			console.log(`    row ${String(i).padStart(3)}   old: ${os.padEnd(28)} new: ${ms}`);
		}
	}
}

console.log(`\n${divergent === 0 ? 'All fixtures match the old loop.' : `${divergent} fixture(s) diverge — see above.`}`);
