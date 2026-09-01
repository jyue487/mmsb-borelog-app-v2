import type { SptBlock } from '@mmsb/core';

/**
 * Reproduces the SPT sheet's own formula chain in TypeScript.
 *
 * Columns S and T of `SPT - AGS` are formulas — S sums the main drive, T is `=AL7`, the tail
 * of a chain running through U, V, W, X, Y, Z, AA, AB, AC, AF, AG, AI, AJ, AK and AL. The
 * report reads both, and it reads them through openpyxl's `data_only=True`, which returns
 * the cached value rather than evaluating anything. So the exporter has to compute what
 * Excel *would* compute and write it into the cache beside the untouched formula.
 *
 * Column letters below refer to the template's own cells so this stays auditable against it.
 * Verified against two real workbooks: `MM1346-VBH-P10.xlsx` row 7 (1,1 / 1,0,0,0 →
 * `N=1 (1,1,1,0,0,0)`) and `CBH-S13-P08` row 7 (1,0 / 1,2,1,2 → `N=6 (1,0,1,2,1,2)`).
 *
 * Note `null`, not zero, means "increment not driven" — Excel's `ISBLANK` is false for 0,
 * and a real log records genuine zero-blow increments. `packages/report` draws the same
 * distinction.
 */

const STANDARD_PENETRATION_MM = 75;
const MAIN_DRIVE_REFUSAL_BLOWS = 50;

/** Columns U, V, X, Y, Z, AA: bare blow count at the standard 75 mm, else `blows/penmm`. */
function increment(blows: number | null, penetrationMm: number | null): string {
	if (blows === null) {
		return '';
	}
	if (penetrationMm === STANDARD_PENETRATION_MM) {
		return String(blows);
	}
	return `${blows}/${penetrationMm}mm`;
}

export interface SptResult {
	/** Column S. */
	readonly nValue: number;
	/** Column T. */
	readonly reportedResult: string;
}

export function computeSptResult(block: SptBlock): SptResult {
	const seatingBlows = [block.seatingIncBlows1, block.seatingIncBlows2] as const;
	const seatingPens = [block.seatingIncPen1, block.seatingIncPen2] as const;
	const mainBlows = [
		block.mainIncBlows1,
		block.mainIncBlows2,
		block.mainIncBlows3,
		block.mainIncBlows4,
	] as const;
	const mainPens = [
		block.mainIncPen1,
		block.mainIncPen2,
		block.mainIncPen3,
		block.mainIncPen4,
	] as const;

	const u = increment(seatingBlows[0], seatingPens[0]);
	const v = increment(seatingBlows[1], seatingPens[1]);
	// W: the seating drive, one increment or two.
	const w = seatingBlows[0] === null ? '' : seatingBlows[1] === null ? u : `${u},${v}`;

	const [x, y, z, aa] = mainBlows.map((blows, index) => increment(blows, mainPens[index]));

	// AB: the first half of the main drive. A first increment of 50 is refusal on its own.
	const ab =
		mainBlows[0] === null
			? ''
			: mainBlows[0] === MAIN_DRIVE_REFUSAL_BLOWS
				? `${mainBlows[0]}/${mainPens[0]}mm`
				: mainBlows[1] === null
					? x
					: `${x},${y}`;

	// AC: the second half, already carrying its own leading comma.
	const ac =
		mainBlows[2] === null ? '' : mainBlows[3] === null ? `,${z}` : `,${z},${aa}`;

	// AF: total main-drive penetration. AG: total main-drive blows.
	const af = mainPens.reduce<number>((total, pen) => total + (pen ?? 0), 0);
	const ag = mainBlows.reduce<number>((total, blows) => total + (blows ?? 0), 0);

	const ai = `N=${ag}`;
	const aj = `${ai} (${w},${ab}${ac})`;
	// AK: the refusal form, which also reports how far the sampler actually got.
	const ak = `${ai}/${af}mm (${w},${ab}${ac})`;

	return {
		nValue: ag,
		reportedResult: ag === MAIN_DRIVE_REFUSAL_BLOWS ? ak : aj,
	};
}
