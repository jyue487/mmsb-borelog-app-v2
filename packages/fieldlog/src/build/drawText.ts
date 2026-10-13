import type { DrawNode, TextLine } from '../model/doc';
import type { HAlign, VAlign } from '../model/table';
import type { FontId, TextMeasurer } from '../text/measure';

/**
 * Small helpers for emitting text and rules at coordinates.
 *
 * Kept separate from the builders so the fiddly parts — a label and a bold value sharing a
 * baseline, a stack of lines pinned to the bottom of a box — are written once.
 */

export function textNode(
	lines: TextLine[],
	x: number,
	y: number,
	w: number,
	h: number,
	leadingPt: number,
	align: HAlign = 'left',
	// `top` is cap-flush (see firstBaselineOffset in the pdf-lib backend), which is what the
	// body table wants and what a one-line box in the header or footer does not: there the box
	// IS one line tall, so centring in it is the placement that leaves the leading symmetric.
	valign: VAlign = 'middle',
): DrawNode {
	return { kind: 'text', x, y, w, h, lines, leadingPt, align, valign };
}

export function run(text: string, sizePt: number, fontId: FontId = 'regular') {
	return { text, fontId, sizePt };
}

export function line(...runs: { text: string; fontId: FontId; sizePt: number }[]): TextLine {
	return { runs };
}

/** `LABEL: ` in regular followed by the value in bold — the header's repeated pattern. */
export function labelledLine(label: string, value: string, sizePt: number): TextLine {
	return line(run(label, sizePt, 'regular'), run(value, sizePt, 'bold'));
}

export function hRule(x: number, y: number, width: number, thicknessPt: number): DrawNode {
	return { kind: 'line', x1: x, y1: y, x2: x + width, y2: y, thicknessPt };
}

export function vRule(x: number, y: number, height: number, thicknessPt: number): DrawNode {
	return { kind: 'line', x1: x, y1: y, x2: x, y2: y + height, thicknessPt };
}

export function box(x: number, y: number, w: number, h: number, thicknessPt: number): DrawNode {
	return { kind: 'rect', x, y, w, h, thicknessPt };
}

/** Stacks plain strings as single-run lines. */
export function stack(texts: string[], sizePt: number, fontId: FontId = 'regular'): TextLine[] {
	return texts.filter((text) => text !== '').map((text) => line(run(text, sizePt, fontId)));
}

export function widthOfLine(textLine: TextLine, measurer: TextMeasurer): number {
	return textLine.runs.reduce((sum, r) => sum + measurer.widthOf(r.text, r.fontId, r.sizePt), 0);
}
