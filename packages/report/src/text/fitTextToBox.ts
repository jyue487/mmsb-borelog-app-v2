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
 */
export const DESCRIPTION_SIZE_LADDER = [7, 6.5, 6, 5.5, 5, 4.5, 4, 3.5] as const;

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
	const lineHeightPt = measurer.lineHeightOf('regular', sizePt) * (lineHeightFactor / DEFAULT_LINE_HEIGHT_FACTOR);
	return { lines, heightPt: lines.length * lineHeightPt, lineHeightPt };
}

/**
 * The largest ladder size whose wrapped text fits the box.
 *
 * This is the fix for the reported symptom. The old code chose a size from character count
 * with no knowledge of the column width or the font, then applied a CSS `scale` transform
 * with a compensating `width: ${(1/scale)*100}%` to fake the sizes it could not express —
 * and on iOS, with no `Math.max(3, …)` floor, a long description in a short block produced
 * `font-size: 0` and `width: Infinity%`. Here the text is measured against the real box
 * with real metrics, so no transform and no floor special-case is needed.
 *
 * Wrapped height is monotone non-increasing in size, so the ladder is binary-searchable:
 * ~3 probes instead of 8.
 */
export function fitTextToBox(
	tokens: RichToken[],
	boxWidthPt: number,
	boxHeightPt: number,
	measurer: TextMeasurer,
	lineHeightFactor = DEFAULT_LINE_HEIGHT_FACTOR,
	ladder: readonly number[] = DESCRIPTION_SIZE_LADDER,
): FitResult {
	if (boxWidthPt <= 0 || ladder.length === 0) {
		return { sizePt: ladder[ladder.length - 1] ?? 0, lines: [], lineHeightPt: 0, overflowed: true };
	}

	// Ladder is descending, so `fits` is false for a prefix and true for a suffix; find the
	// first index that fits.
	let low = 0;
	let high = ladder.length - 1;
	let bestIndex = -1;

	while (low <= high) {
		const mid = (low + high) >> 1;
		const { heightPt } = layoutAt(tokens, boxWidthPt, ladder[mid], measurer, lineHeightFactor);
		if (heightPt <= boxHeightPt) {
			bestIndex = mid;
			high = mid - 1;
		} else {
			low = mid + 1;
		}
	}

	if (bestIndex === -1) {
		// Nothing fits. Use the smallest size and report it; the caller clips and raises a
		// warning rather than silently letting text escape its cell.
		const smallest = ladder[ladder.length - 1];
		const { lines, lineHeightPt } = layoutAt(tokens, boxWidthPt, smallest, measurer, lineHeightFactor);
		const maxLines = lineHeightPt > 0 ? Math.max(0, Math.floor(boxHeightPt / lineHeightPt)) : 0;
		return { sizePt: smallest, lines: lines.slice(0, maxLines), lineHeightPt, overflowed: true };
	}

	const sizePt = ladder[bestIndex];
	const { lines, lineHeightPt } = layoutAt(tokens, boxWidthPt, sizePt, measurer, lineHeightFactor);
	return { sizePt, lines, lineHeightPt, overflowed: false };
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
