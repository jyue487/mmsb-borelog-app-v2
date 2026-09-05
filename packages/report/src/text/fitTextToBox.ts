import { breakIntoLines, type LaidOutLine } from './lineBreak';
import { DEFAULT_LINE_HEIGHT_FACTOR, type TextMeasurer } from './measure';
import type { RichToken } from './richText';

/**
 * The sizes the DESCRIPTION column is allowed to use, largest first.
 *
 * A ladder rather than a continuous range so a page reads as one or two sizes instead of a
 * different size on every row. The old formula
 * (`Math.floor(11 - description.length / numberOfTicksToRender / 10)`,
 * `renderDescriptionToHtml.ts:7`) produced a different value for almost every block, which
 * is why type size visibly jitters down the page today.
 *
 * The top rung tracks `BASE_FONT_SIZE_PT`: a description short enough to set at the ceiling
 * must not come out larger than the sample label and blow counts on its own row.
 */
export const DESCRIPTION_SIZE_LADDER = [6.5, 6, 5.5, 5, 4.5, 4, 3.5] as const;

export interface FitResult {
	sizePt: number;
	lines: LaidOutLine[];
	lineHeightPt: number;
	/** True when even the smallest size overflows, so the caller must clip and warn. */
	overflowed: boolean;
}

function layoutAt(
	tokens: RichToken[],
	boxWidthPt: number,
	sizePt: number,
	measurer: TextMeasurer,
	lineHeightFactor: number,
): { lines: LaidOutLine[]; heightPt: number; lineHeightPt: number } {
	const lines = breakIntoLines(tokens, boxWidthPt, sizePt, measurer);
	// A multiple of the type size, as every other cell computes its leading. This used to be
	// the font's ascent-to-descent height times the factor, which for NotoSans is 1.36 em —
	// so the description alone was set a third looser than the columns beside it.
	const lineHeightPt = sizePt * lineHeightFactor;
	return { lines, heightPt: lines.length * lineHeightPt, lineHeightPt };
}

/** How many whole lines of `lineHeightPt` a box of this height can hold. */
function capacityOf(boxHeightPt: number, lineHeightPt: number): number {
	if (lineHeightPt <= 0) {
		return 0;
	}
	return Math.max(0, Math.floor(boxHeightPt / lineHeightPt));
}

/** Fill each box to capacity in turn. Lines with nowhere left to go are dropped. */
function dealIntoBoxes(
	lines: LaidOutLine[],
	boxHeightsPt: readonly number[],
	lineHeightPt: number,
): LaidOutLine[][] {
	const perBox: LaidOutLine[][] = [];
	let cursor = 0;
	for (const boxHeightPt of boxHeightsPt) {
		const take = capacityOf(boxHeightPt, lineHeightPt);
		perBox.push(lines.slice(cursor, cursor + take));
		cursor += take;
	}
	return perBox;
}

export interface MultiBoxFitResult {
	sizePt: number;
	lineHeightPt: number;
	/** One entry per box, in order. A box too short for a single line gets none. */
	perBox: LaidOutLine[][];
	/** True when even the smallest size overflows the boxes together. */
	overflowed: boolean;
}

/**
 * The largest ladder size at which the wrapped text fits the given boxes, end to end.
 *
 * This is the fix for the reported symptom. The old code chose a size from character count
 * with no knowledge of the column width or the font, then applied a CSS `scale` transform
 * with a compensating `width: ${(1/scale)*100}%` to fake the sizes it could not express —
 * and on iOS, with no `Math.max(3, …)` floor, a long description in a short block produced
 * `font-size: 0` and `width: Infinity%`. Here the text is measured against the real box
 * with real metrics, so no transform and no floor special-case is needed.
 *
 * More than one box means a block whose depth interval crosses a page break: its description
 * continues at the top of the next page. **One size is chosen for all of them**, because a
 * paragraph that sets at 6.5pt on one page and 5pt on the next reads as two different
 * paragraphs. Every box is the same column, so there is one wrap per probe however many
 * pages the block spans.
 *
 * Both effects of shrinking — fewer lines, and more of them per box — push the same way, so
 * `fits` is false for a prefix of the descending ladder and true for the rest: binary
 * searchable, ~3 probes instead of 8.
 */
export function fitTextAcrossBoxes(
	tokens: RichToken[],
	boxWidthPt: number,
	boxHeightsPt: readonly number[],
	measurer: TextMeasurer,
	lineHeightFactor = DEFAULT_LINE_HEIGHT_FACTOR,
	ladder: readonly number[] = DESCRIPTION_SIZE_LADDER,
): MultiBoxFitResult {
	if (boxWidthPt <= 0 || ladder.length === 0 || boxHeightsPt.length === 0) {
		return {
			sizePt: ladder[ladder.length - 1] ?? 0,
			lineHeightPt: 0,
			perBox: boxHeightsPt.map(() => []),
			overflowed: true,
		};
	}

	let low = 0;
	let high = ladder.length - 1;
	let bestIndex = -1;

	while (low <= high) {
		const mid = (low + high) >> 1;
		const { lines, lineHeightPt } = layoutAt(tokens, boxWidthPt, ladder[mid], measurer, lineHeightFactor);
		const capacity = boxHeightsPt.reduce((sum, boxHeightPt) => sum + capacityOf(boxHeightPt, lineHeightPt), 0);
		if (lines.length <= capacity) {
			bestIndex = mid;
			high = mid - 1;
		} else {
			low = mid + 1;
		}
	}

	// Nothing fits. Use the smallest size and report it; the caller clips and raises a
	// warning rather than silently letting text escape its cell.
	const sizePt = bestIndex === -1 ? ladder[ladder.length - 1] : ladder[bestIndex];
	const { lines, lineHeightPt } = layoutAt(tokens, boxWidthPt, sizePt, measurer, lineHeightFactor);
	return {
		sizePt,
		lineHeightPt,
		perBox: dealIntoBoxes(lines, boxHeightsPt, lineHeightPt),
		overflowed: bestIndex === -1,
	};
}

/** The one-box case: a block that fits on a single page, which is nearly all of them. */
export function fitTextToBox(
	tokens: RichToken[],
	boxWidthPt: number,
	boxHeightPt: number,
	measurer: TextMeasurer,
	lineHeightFactor = DEFAULT_LINE_HEIGHT_FACTOR,
	ladder: readonly number[] = DESCRIPTION_SIZE_LADDER,
): FitResult {
	const fit = fitTextAcrossBoxes(tokens, boxWidthPt, [boxHeightPt], measurer, lineHeightFactor, ladder);
	return {
		sizePt: fit.sizePt,
		lines: fit.perBox[0] ?? [],
		lineHeightPt: fit.lineHeightPt,
		overflowed: fit.overflowed,
	};
}

/** Single-line fit for header fields, where the old CSS used `text-overflow: ellipsis`. */
export function fitSingleLine(
	text: string,
	maxWidthPt: number,
	sizePt: number,
	fontId: Parameters<TextMeasurer['widthOf']>[1],
	measurer: TextMeasurer,
	ellipsis = '…',
): string {
	if (measurer.widthOf(text, fontId, sizePt) <= maxWidthPt) {
		return text;
	}
	let low = 0;
	let high = text.length;
	while (low < high) {
		const mid = (low + high + 1) >> 1;
		if (measurer.widthOf(text.slice(0, mid) + ellipsis, fontId, sizePt) <= maxWidthPt) {
			low = mid;
		} else {
			high = mid - 1;
		}
	}
	return low === 0 ? '' : text.slice(0, low) + ellipsis;
}
