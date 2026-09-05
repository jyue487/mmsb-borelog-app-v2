/**
 * Text measurement, decoupled from pdf-lib.
 *
 * The whole point of leaving HTML was to stop guessing text size from `description.length`
 * and start measuring it. But the model layer must stay platform-free, so it talks to this
 * interface rather than to a `PDFFont` — which also means the layout can be exercised in
 * Node with a stub measurer, no PDF and no device involved.
 */

export type FontId = 'regular' | 'bold' | 'italic';

export interface TextMeasurer {
	/** Advance width of `text` at `sizePt`, in points. */
	widthOf(text: string, fontId: FontId, sizePt: number): number;
	/**
	 * Cap height at `sizePt`. Every vertical placement in the report is expressed against the
	 * cap box: it is the top of a capital or a digit, which is what a reader sees as the top
	 * of a line, and unlike the ascender it is what makes two different type sizes look level.
	 */
	capHeightOf(fontId: FontId, sizePt: number): number;
}

/** Leading as a multiple of the type size; matches the old stylesheet's `--base-line-height`. */
export const DEFAULT_LINE_HEIGHT_FACTOR = 1.15;

/**
 * A measurer for tests and snapshots: every glyph is a fixed fraction of the point size.
 * Deliberately crude — it exists so pagination and wrapping can be exercised without
 * embedding a font, not to approximate NotoSans.
 */
export function createFixedWidthMeasurer(widthFactor = 0.5): TextMeasurer {
	return {
		widthOf: (text, _fontId, sizePt) => text.length * widthFactor * sizePt,
		capHeightOf: (_fontId, sizePt) => sizePt * 0.7,
	};
}
