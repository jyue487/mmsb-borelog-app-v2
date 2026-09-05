/**
 * Differential check: does the restructured paginate() place blocks where the old loop did?
 *
 *   pnpm --filter @mmsb/report oracle
 *
 * Any divergence is printed. A divergence is only acceptable if it is one the migration
 * deliberately made; anything else means the restructuring changed behaviour by accident
 * and needs explaining. There are three deliberate ones, each recognised below rather than
 * waved through by fixture name:
 *
 *  - an empty borehole, where the old code threw on an unguarded `blocks[length - 1]`;
 *  - out-of-order depths, where the old loop ran away producing pages for ever;
 *  - **page breaks**, where a block that outgrows the space left on a page is now split and
 *    continued rather than moved whole (or truncated and dropped). This one is worth being
 *    precise about, because of how little it disturbs: the split part occupies exactly the
 *    ticks the old blank filler occupied, and the block still ends at the same depth, so
 *    every row keeps its startTick and tickCount and only the labels move. That is the
 *    signature checked for — same geometry, differences confined to filler-versus-block. A
 *    row that actually moved would fail here, as it should.
 */
import { FIXTURES } from '../fixtures/builders.ts';
import { paginate } from '../src/layout/paginate.ts';
import { paginateOracle } from './referenceOracle.ts';

interface ComparedRow {
	label: string;
	startTick: number;
	tickCount: number;
}

const FILLER = '(filler)';

/**
 * True when the two layouts tile the page identically and differ only in whether a given
 * slot is blank filler or part of a block — the page-break change, and nothing else.
 */
function differsOnlyByPageBreakSplit(oracleRows: ComparedRow[], mineRows: ComparedRow[]): boolean {
	if (oracleRows.length !== mineRows.length) {
		return false;
	}
	return oracleRows.every((o, i) => {
		const m = mineRows[i];
		if (o.startTick !== m.startTick || o.tickCount !== m.tickCount) {
			return false;
		}
		return o.label === m.label || o.label === FILLER || m.label === FILLER;
	});
}

let divergent = 0;
let expected = 0;

for (const [name, blocks] of Object.entries(FIXTURES)) {
	// The old loop threw outright on an empty borehole, so there is nothing to compare.
	if (blocks.length === 0) {
		expected += 1;
		console.log(`${name.padEnd(26)} EXPECTED — old code threw here (blocks[length-1] unguarded)`);
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
		expected += 1;
		console.log(`${name.padEnd(26)} EXPECTED — old loop ran away (>200 pages); new one produced ${mine.pages.length} page(s) + ${mine.warnings.length} warning(s)`);
		continue;
	}

	const a = JSON.stringify(oracle.rows);
	const b = JSON.stringify(mineRows);
	if (a === b) {
		console.log(`${name.padEnd(26)} match    (${mine.pages.length} page(s), ${mineRows.length} rows)`);
		continue;
	}

	if (differsOnlyByPageBreakSplit(oracle.rows, mineRows)) {
		expected += 1;
		const changed = mineRows.filter((m, i) => m.label !== oracle.rows[i].label);
		console.log(
			`${name.padEnd(26)} EXPECTED — page-break split; ${changed.length} row(s) now continue a block where the old loop left blank filler`,
		);
		for (const row of changed) {
			console.log(`    ${String(row.startTick).padStart(4)}+${String(row.tickCount).padEnd(3)}  ${row.label}`);
		}
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

console.log(
	`\n${
		divergent === 0
			? `All fixtures match the old loop, or diverge only in the ${expected} documented way(s) above.`
			: `${divergent} fixture(s) diverge UNEXPECTEDLY — see above.`
	}`,
);
