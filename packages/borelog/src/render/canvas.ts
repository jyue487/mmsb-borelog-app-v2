import {
	appendBezierCurve,
	beginText,
	clip,
	closePath,
	concatTransformationMatrix,
	drawObject,
	endPath,
	endText,
	fill,
	fillAndStroke,
	lineTo,
	LineCapStyle,
	moveTo,
	popGraphicsState,
	pushGraphicsState,
	rectangle,
	setDashPattern,
	setFillingRgbColor,
	setFontAndSize,
	setLineCap,
	setLineWidth,
	setStrokingRgbColor,
	setTextMatrix,
	setWordSpacing,
	showText,
	StandardFonts,
	stroke,
	type PDFDocument,
	type PDFFont,
	type PDFImage,
	type PDFName,
	type PDFOperator,
	type PDFPage,
} from 'pdf-lib';

import { PAGE_HEIGHT, PAGE_WIDTH } from './config';

/**
 * The slice of reportlab's `Canvas` the Python program calls, over pdf-lib.
 *
 * Each call emits the PDF operators reportlab's would, into the same graphics state:
 * `saveState`/`restoreState` are `q`/`Q`, colours and line width persist until restored,
 * and coordinates pass through untouched (both libraries put the origin at the bottom left
 * with y up). That is what lets the drawing code above it be a line-for-line port.
 */

export type FontName = 'Helvetica' | 'Helvetica-Bold' | 'Helvetica-Oblique' | 'Helvetica-BoldOblique';

const STANDARD_FONT: Record<FontName, StandardFonts> = {
	Helvetica: StandardFonts.Helvetica,
	'Helvetica-Bold': StandardFonts.HelveticaBold,
	'Helvetica-Oblique': StandardFonts.HelveticaOblique,
	'Helvetica-BoldOblique': StandardFonts.HelveticaBoldOblique,
};

export type Rgb = readonly [number, number, number];

/** reportlab.lib.colors */
export const colors = {
	black: [0, 0, 0] as Rgb,
	blue: [0, 0, 1] as Rgb,
	grey: [128 / 255, 128 / 255, 128 / 255] as Rgb,
};

/**
 * The standard-14 Helvetica faces: the same Adobe metrics reportlab measures with, so a
 * string is exactly as wide here as it was there and every line breaks in the same place.
 */
export class Fonts {
	private readonly fonts = new Map<FontName, PDFFont>();
	private readonly glyphWidths = new Map<FontName, Map<string, number>>();
	private readonly charsets = new Map<FontName, Set<number>>();

	private readonly doc: PDFDocument;

	constructor(doc: PDFDocument) {
		this.doc = doc;
	}

	get(name: FontName): PDFFont {
		let font = this.fonts.get(name);
		if (!font) {
			font = this.doc.embedStandardFont(STANDARD_FONT[name]);
			this.fonts.set(name, font);
		}
		return font;
	}

	/**
	 * Helvetica's built-in encoding is WinAnsi, and pdf-lib throws on anything outside it
	 * where reportlab drew an empty box. Control characters (a line break typed into a
	 * cell) are dropped; anything else unencodable becomes `?`.
	 */
	sanitise(text: string, name: FontName): string {
		let charset = this.charsets.get(name);
		if (!charset) {
			charset = new Set(this.get(name).getCharacterSet());
			this.charsets.set(name, charset);
		}
		let out = '';
		for (const ch of text) {
			const code = ch.codePointAt(0)!;
			if (code < 0x20 || (code >= 0x7f && code < 0xa0)) continue;
			out += charset.has(code) ? ch : '?';
		}
		return out;
	}

	/**
	 * reportlab's `stringWidth`: the sum of the glyph advances. pdf-lib's own
	 * `widthOfTextAtSize` also applies AFM kerning pairs, which reportlab never does — and
	 * which no viewer applies when it draws the string either — so it is summed per glyph.
	 */
	stringWidth(text: string, name: FontName, size: number): number {
		let widths = this.glyphWidths.get(name);
		if (!widths) {
			widths = new Map();
			this.glyphWidths.set(name, widths);
		}
		const font = this.get(name);
		let total = 0;
		for (const ch of this.sanitise(text, name)) {
			let width = widths.get(ch);
			if (width === undefined) {
				width = font.widthOfTextAtSize(ch, 1000);
				widths.set(ch, width);
			}
			total += width;
		}
		return (total * size) / 1000;
	}
}

interface GraphicsState {
	fontName: FontName;
	fontSize: number;
	fillColor: Rgb;
	strokeColor: Rgb;
}

export class Canvas {
	private page: PDFPage | null = null;
	private pageNumber = 1;
	private state: GraphicsState = Canvas.initialState();
	private readonly stack: GraphicsState[] = [];
	private fontKeys = new Map<FontName, PDFName>();
	private imageKeys = new Map<PDFImage, PDFName>();

	private readonly doc: PDFDocument;
	readonly fonts: Fonts;

	constructor(doc: PDFDocument, fonts: Fonts) {
		this.doc = doc;
		this.fonts = fonts;
	}

	private static initialState(): GraphicsState {
		return { fontName: 'Helvetica', fontSize: 12, fillColor: colors.black, strokeColor: colors.black };
	}

	/** reportlab starts a page on the first thing drawn, so a final `showPage` adds none. */
	private ops(...operators: PDFOperator[]): void {
		if (!this.page) {
			this.page = this.doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
			this.fontKeys = new Map();
			this.imageKeys = new Map();
		}
		this.page.pushOperators(...operators);
	}

	getPageNumber(): number {
		return this.pageNumber;
	}

	showPage(): void {
		if (!this.page) this.ops();
		this.page = null;
		this.pageNumber++;
		this.state = Canvas.initialState();
		this.stack.length = 0;
	}

	saveState(): void {
		this.stack.push({ ...this.state });
		this.ops(pushGraphicsState());
	}

	restoreState(): void {
		const previous = this.stack.pop();
		if (!previous) throw new Error('restoreState without a matching saveState');
		this.state = previous;
		this.ops(popGraphicsState());
	}

	setFont(name: FontName, size: number): void {
		this.state.fontName = name;
		this.state.fontSize = size;
	}

	setFontSize(size: number): void {
		this.state.fontSize = size;
	}

	setFillColor(rgb: Rgb): void {
		this.state.fillColor = rgb;
		this.ops(setFillingRgbColor(...rgb));
	}

	setStrokeColor(rgb: Rgb): void {
		this.state.strokeColor = rgb;
		this.ops(setStrokingRgbColor(...rgb));
	}

	setLineWidth(width: number): void {
		this.ops(setLineWidth(width));
	}

	/** 0 butt (the PDF default), 1 round. */
	setLineCap(cap: 0 | 1): void {
		this.ops(setLineCap(cap === 1 ? LineCapStyle.Round : LineCapStyle.Butt));
	}

	setDash(on: number, off: number): void {
		this.ops(setDashPattern([on, off], 0));
	}

	translate(dx: number, dy: number): void {
		this.ops(concatTransformationMatrix(1, 0, 0, 1, dx, dy));
	}

	scale(sx: number, sy: number): void {
		this.ops(concatTransformationMatrix(sx, 0, 0, sy, 0, 0));
	}

	line(x1: number, y1: number, x2: number, y2: number): void {
		this.ops(moveTo(x1, y1), lineTo(x2, y2), stroke());
	}

	rect(x: number, y: number, width: number, height: number): void {
		this.ops(rectangle(x, y, width, height), stroke());
	}

	/** Clips everything after it, until the enclosing `restoreState`, to the rectangle. */
	clipRect(x: number, y: number, width: number, height: number): void {
		this.ops(rectangle(x, y, width, height), clip(), endPath());
	}

	circle(x: number, y: number, r: number, doStroke: boolean, doFill: boolean): void {
		// Four quarter arcs, the usual 0.5523 control-point approximation.
		const k = 0.5522847498307936 * r;
		this.ops(
			moveTo(x + r, y),
			appendBezierCurve(x + r, y + k, x + k, y + r, x, y + r),
			appendBezierCurve(x - k, y + r, x - r, y + k, x - r, y),
			appendBezierCurve(x - r, y - k, x - k, y - r, x, y - r),
			appendBezierCurve(x + k, y - r, x + r, y - k, x + r, y),
			closePath(),
			doStroke && doFill ? fillAndStroke() : doFill ? fill() : doStroke ? stroke() : endPath(),
		);
	}

	stringWidth(text: string, name: FontName = this.state.fontName, size: number = this.state.fontSize): number {
		return this.fonts.stringWidth(text, name, size);
	}

	/**
	 * `wordSpace` is reportlab's `setWordSpace` (the PDF `Tw` operator): extra advance after
	 * every space, which is how a paragraph line squeezed by space shrinkage is drawn.
	 */
	drawString(
		x: number,
		y: number,
		text: string,
		font: FontName = this.state.fontName,
		size: number = this.state.fontSize,
		wordSpace = 0,
	): void {
		const clean = this.fonts.sanitise(text, font);
		if (clean === '') return;
		let key = this.fontKeys.get(font);
		if (!key) {
			this.ops();
			const pdfFont = this.fonts.get(font);
			key = this.page!.node.newFontDictionary(pdfFont.name, pdfFont.ref);
			this.fontKeys.set(font, key);
		}
		const show = showText(this.fonts.get(font).encodeText(clean));
		this.ops(
			beginText(),
			setFontAndSize(key, size),
			setTextMatrix(1, 0, 0, 1, x, y),
			...(wordSpace !== 0 ? [setWordSpacing(wordSpace), show, setWordSpacing(0)] : [show]),
			endText(),
		);
	}

	drawCentredString(x: number, y: number, text: string): void {
		this.drawString(x - this.stringWidth(text) / 2, y, text);
	}

	drawImage(image: PDFImage, x: number, y: number, width: number, height: number): void {
		let key = this.imageKeys.get(image);
		if (!key) {
			this.ops();
			key = this.page!.node.newXObject('Image', image.ref);
			this.imageKeys.set(image, key);
		}
		this.ops(pushGraphicsState(), concatTransformationMatrix(width, 0, 0, height, x, y), drawObject(key), popGraphicsState());
	}
}
