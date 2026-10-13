import type { TextMeasurer } from './measure';

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
