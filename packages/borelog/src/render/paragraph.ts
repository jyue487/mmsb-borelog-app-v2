import type { Canvas, FontName, Fonts } from './canvas';

/**
 * The part of reportlab's `Paragraph` and `KeepInFrame(mode="shrink")` the Python program
 * uses, reproduced from reportlab 4.4's source rather than approximated: the same greedy
 * word wrap (including its 5% space shrinkage and its splitting of over-long words), the
 * same line pitch and first baseline, the same `split` rules for carrying a description
 * over a page break, and the same quadratic search for a shrink-to-fit scale.
 *
 * Text is reportlab markup, as it was in Python: `<para align>`, `<br/>`, `<b>`, `<i>` and
 * `<font size>` are honoured. Two deliberate differences from reportlab: an unknown tag is
 * printed as text instead of failing the whole export, and a bare `&` stays an `&` —
 * reportlab's parser turns `G&P` into `G&P;`.
 */

const FUZZ = 1e-6;
/** rl_settings.spaceShrinkage */
const SPACE_SHRINKAGE = 0.05;

export type Alignment = 'left' | 'center';

export interface ParagraphStyle {
	fontName?: FontName;
	/** reportlab's default is 10. */
	fontSize?: number;
	/** reportlab's default is 12, whatever the font size. */
	leading?: number;
	alignment?: Alignment;
}

interface Run {
	readonly text: string;
	readonly font: FontName;
	readonly size: number;
}

interface Word {
	readonly kind: 'word';
	readonly runs: readonly Run[];
}

interface Break {
	readonly kind: 'break';
	/** Font size in force at the `<br/>`, which an otherwise empty line takes its height from. */
	readonly size: number;
}

type Item = Word | Break;

interface Line {
	readonly words: readonly Word[];
	/** maxWidth minus the width used: negative when space shrinkage let the line overrun. */
	readonly extraSpace: number;
	/** The largest font size on the line; the first line's sets the first baseline. */
	readonly fontSize: number;
	readonly endedByBreak: boolean;
}

// reportlab splits on whitespace but not on a no-break space.
const SPLIT_WS = /[ \t\n\r\x0b\x0c\x1c\x1d\x1e\x1f\x85\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000]/;

const ENTITIES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: '\xa0' };

function decodeEntities(text: string): string {
	return text.replace(/&(#x[0-9a-fA-F]+|#[0-9]+|[a-zA-Z]+);/g, (whole, entity: string) => {
		if (entity.startsWith('#x')) return String.fromCodePoint(parseInt(entity.slice(2), 16));
		if (entity.startsWith('#')) return String.fromCodePoint(parseInt(entity.slice(1), 10));
		return ENTITIES[entity] ?? whole;
	});
}

function faceOf(bold: boolean, italic: boolean): FontName {
	if (bold && italic) return 'Helvetica-BoldOblique';
	if (bold) return 'Helvetica-Bold';
	if (italic) return 'Helvetica-Oblique';
	return 'Helvetica';
}

function attribute(attrs: string, name: string): string | undefined {
	const match = new RegExp(`\\b${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s"'>/]+))`, 'i').exec(attrs);
	return match ? (match[1] ?? match[2] ?? match[3]) : undefined;
}

/** Markup → words and line breaks, plus any `<para align>`. */
function parseMarkup(markup: string, baseSize: number): { items: Item[]; alignment?: Alignment; simple: boolean } {
	const items: Item[] = [];
	let alignment: Alignment | undefined;
	const sizeStack: number[] = [baseSize];
	let bold = 0;
	let italic = 0;

	let pendingRuns: Run[] = [];
	const flushWord = () => {
		if (pendingRuns.length > 0) items.push({ kind: 'word', runs: pendingRuns });
		pendingRuns = [];
	};
	const addText = (text: string) => {
		const font = faceOf(bold > 0, italic > 0);
		const size = sizeStack[sizeStack.length - 1];
		// Whitespace ends a word; text with none continues the current one, so `x<i>y</i>`
		// stays one word in two faces.
		const pieces = text.split(SPLIT_WS);
		pieces.forEach((piece, index) => {
			if (index > 0) flushWord();
			if (piece !== '') pendingRuns.push({ text: piece, font, size });
		});
	};

	const tagPattern = /<(\/?)([a-zA-Z]+)\b([^<>]*?)(\/?)>/g;
	let last = 0;
	// reportlab takes a single-fragment fast path ("kind 0") for text with no tags and no
	// entities, and the two paths record a line's spare width differently in one case.
	let simple = !markup.includes('&');
	for (const match of markup.matchAll(tagPattern)) {
		const [whole, closing, rawName, attrs, selfClosing] = match;
		const name = rawName.toLowerCase();
		const known = ['para', 'br', 'b', 'strong', 'i', 'em', 'font'].includes(name);
		if (!known) continue;
		simple = false;
		addText(decodeEntities(markup.slice(last, match.index)));
		last = match.index + whole.length;
		if (name === 'br') {
			flushWord();
			items.push({ kind: 'break', size: sizeStack[sizeStack.length - 1] });
		} else if (name === 'para') {
			if (!closing) {
				const align = attribute(attrs, 'align')?.toLowerCase();
				if (align === 'center' || align === 'centre') alignment = 'center';
				else if (align === 'left') alignment = 'left';
			}
		} else if (name === 'b' || name === 'strong') {
			bold += closing ? -1 : selfClosing ? 0 : 1;
		} else if (name === 'i' || name === 'em') {
			italic += closing ? -1 : selfClosing ? 0 : 1;
		} else if (name === 'font') {
			if (closing) {
				if (sizeStack.length > 1) sizeStack.pop();
			} else if (!selfClosing) {
				const size = Number(attribute(attrs, 'size'));
				sizeStack.push(Number.isFinite(size) && size > 0 ? size : sizeStack[sizeStack.length - 1]);
			}
		}
	}
	addText(decodeEntities(markup.slice(last)));
	flushWord();
	return { items, alignment, simple };
}

export class Paragraph {
	private readonly items: readonly Item[];
	private readonly fontName: FontName;
	private readonly fontSize: number;
	readonly leading: number;
	private readonly alignment: Alignment;
	private readonly simple: boolean;
	private lines: Line[] | null = null;
	width = 0;
	height = 0;

	private readonly fonts: Fonts;

	constructor(
		fonts: Fonts,
		source: string | { items: readonly Item[]; alignment: Alignment; simple: boolean },
		style: ParagraphStyle = {},
	) {
		this.fonts = fonts;
		this.fontName = style.fontName ?? 'Helvetica';
		this.fontSize = style.fontSize ?? 10;
		this.leading = style.leading ?? 12;
		if (typeof source === 'string') {
			const parsed = parseMarkup(source, this.fontSize);
			// Markup only ever switches between the Helvetica faces, from the style's own.
			this.items = this.fontName === 'Helvetica' ? parsed.items : parsed.items.map((item) => this.rebase(item));
			this.alignment = parsed.alignment ?? style.alignment ?? 'left';
			this.simple = parsed.simple;
		} else {
			this.items = source.items;
			this.alignment = source.alignment;
			this.simple = source.simple;
		}
	}

	private rebase(item: Item): Item {
		if (item.kind === 'break') return item;
		return { kind: 'word', runs: item.runs.map((run) => ({ ...run, font: run.font === 'Helvetica' ? this.fontName : run.font })) };
	}

	private runWidth(run: Run): number {
		return this.fonts.stringWidth(run.text, run.font, run.size);
	}

	private wordWidth(word: Word): number {
		return word.runs.reduce((sum, run) => sum + this.runWidth(run), 0);
	}

	/** The space after a word is set in the face of its last run. */
	private spaceAfter(word: Word): number {
		const last = word.runs[word.runs.length - 1];
		return this.fonts.stringWidth(' ', last.font, last.size);
	}

	/**
	 * reportlab `_splitWord`: an over-long word cut character by character into pieces, the
	 * first sized to the room left on the current line and the rest to whole lines. An empty
	 * first piece means not even one character fitted, and just ends the current line.
	 */
	private splitLongWord(word: Word, firstLineUsed: number, maxWidth: number): Word[] {
		const pieces: Word[] = [];
		let runs: Run[] = [];
		let text = '';
		let used = firstLineUsed;
		let started = false;
		for (const run of word.runs) {
			for (const ch of run.text) {
				const cw = this.fonts.stringWidth(ch, run.font, run.size);
				if (used + cw > maxWidth && (started || cw <= maxWidth)) {
					if (text !== '') runs.push({ ...run, text });
					pieces.push({ kind: 'word', runs });
					runs = [];
					text = '';
					used = 0;
				}
				text += ch;
				started = true;
				used += cw;
			}
			if (text !== '') runs.push({ ...run, text });
			text = '';
		}
		if (runs.length > 0) pieces.push({ kind: 'word', runs });
		return pieces;
	}

	/** reportlab `Paragraph.breakLines`: greedy, with 5% space shrinkage and long-word splitting. */
	private breakLines(maxWidth: number): Line[] {
		const lines: Line[] = [];
		let words: Word[] = [];
		let used = 0;
		let spaces = 0;
		const close = (endedByBreak: boolean, breakSize = 0) => {
			const sizes = words.flatMap((w) => w.runs.map((r) => r.size));
			const fontSize = sizes.length > 0 || breakSize > 0 ? Math.max(breakSize, ...sizes) : this.fontSize;
			lines.push({ words, extraSpace: maxWidth - used, fontSize, endedByBreak });
			words = [];
			used = 0;
			spaces = 0;
		};
		const queue: Item[] = [...this.items];
		const splitPieces = new Set<Word>();
		// reportlab's `forcedSplit`: the line closes straight after the next word is placed.
		let forcedSplit = false;
		while (queue.length > 0) {
			const item = queue.shift()!;
			if (item.kind === 'break') {
				close(true, item.size);
				continue;
			}
			if (item.runs.length === 0) forcedSplit = true;
			const width = this.wordWidth(item);
			const space = words.length > 0 ? this.spaceAfter(words[words.length - 1]) : 0;
			const newWidth = words.length > 0 ? used + space + width : width;
			const limit = maxWidth + SPACE_SHRINKAGE * (spaces + space);
			if (newWidth > limit && !forcedSplit && !splitPieces.has(item) && width > maxWidth) {
				const pieces = this.splitLongWord(item, words.length > 0 ? used + space : 0, maxWidth);
				pieces.forEach((piece) => splitPieces.add(piece));
				queue.unshift(...pieces);
				forcedSplit = true;
				continue;
			}
			if (newWidth <= limit || words.length === 0 || forcedSplit) {
				if (item.runs.length > 0) words.push(item);
				// An empty piece only ends the line. The simple path counts the space before
				// it as used; the fragment path ends the line with an injected break, which
				// does not.
				if (item.runs.length > 0 || this.simple) used = newWidth;
				spaces += space;
				if (forcedSplit) {
					forcedSplit = false;
					close(false);
				}
			} else {
				close(false);
				words.push(item);
				used = width;
			}
		}
		if (words.length > 0) close(false);
		return lines;
	}

	wrap(availWidth: number, _availHeight: number): [number, number] {
		if (availWidth < FUZZ) return [0, 0x7fffffff];
		this.width = availWidth;
		this.lines = this.breakLines(availWidth);
		this.height = this.lines.length * this.leading;
		return [this.width, this.height];
	}

	/**
	 * reportlab `Paragraph.split`. `[]` when not even two lines fit (it forbids orphans) or
	 * there is no text at all; `[this]` when it all fits; otherwise the lines that fit and
	 * the rest, as two new paragraphs.
	 */
	split(availWidth: number, availHeight: number): Paragraph[] {
		if (this.items.length === 0 || availWidth < FUZZ || availHeight < FUZZ) return [];
		if (!this.lines) this.wrap(availWidth, availHeight);
		const lines = this.lines!;
		const fit = Math.trunc(availHeight / this.leading);
		if (fit <= 1) {
			this.lines = null;
			return [];
		}
		if (lines.length <= fit) return [this];
		const itemsOf = (part: Line[]): Item[] =>
			part.flatMap((line): Item[] => (line.endedByBreak ? [...line.words, { kind: 'break', size: line.fontSize }] : [...line.words]));
		const style = { fontName: this.fontName, fontSize: this.fontSize, leading: this.leading };
		const source = (part: Line[]) => ({ items: itemsOf(part), alignment: this.alignment, simple: this.simple });
		const first = new Paragraph(this.fonts, source(lines.slice(0, fit)), style);
		first.lines = lines.slice(0, fit);
		first.width = availWidth;
		first.height = fit * this.leading;
		const rest = new Paragraph(this.fonts, source(lines.slice(fit)), style);
		return [first, rest];
	}

	drawOn(canvas: Canvas, x: number, y: number): void {
		const lines = this.lines;
		if (!lines || lines.length === 0) return;
		canvas.saveState();
		canvas.translate(x, y);
		canvas.saveState();
		canvas.setFillColor([0, 0, 0]);
		let baseline = this.height - lines[0].fontSize;
		for (const line of lines) {
			this.drawLine(canvas, line, baseline);
			baseline -= this.leading;
		}
		canvas.restoreState();
		canvas.restoreState();
	}

	/**
	 * Like reportlab, a line is drawn as one string per run of a single face — words joined
	 * by their spaces — rather than word by word, so glyphs advance by the viewer's metrics
	 * within a run exactly as they did in the Python output.
	 */
	private drawLine(canvas: Canvas, line: Line, baseline: number): void {
		const nSpaces = line.words.length - 1;
		// A line that overran by its space shrinkage is drawn with tighter word spacing.
		const simple = line.extraSpace > -1e-8 || nSpaces <= 0;
		const wordSpace = simple ? 0 : line.extraSpace / nSpaces;

		const segments: Run[] = [];
		line.words.forEach((word, index) => {
			word.runs.forEach((run) => {
				const last = segments[segments.length - 1];
				if (last && last.font === run.font && last.size === run.size) {
					segments[segments.length - 1] = { ...last, text: last.text + run.text };
				} else {
					segments.push(run);
				}
			});
			// The space after a word belongs to the segment it ends.
			if (index < nSpaces) {
				const last = segments[segments.length - 1];
				segments[segments.length - 1] = { ...last, text: `${last.text} ` };
			}
		});

		let x = this.alignment === 'center' && simple ? 0.5 * line.extraSpace : 0;
		for (const segment of segments) {
			canvas.drawString(x, baseline, segment.text, segment.font, segment.size, wordSpace);
			const spaces = segment.text.split(' ').length - 1;
			x += this.runWidth(segment) + wordSpace * spaces;
		}
	}
}

/** reportlab `_hmodel`: fit h = a/s² + b/s through two observations. */
function hmodel(s0: number, s1: number, h0: number, h1: number): [number, number] {
	const a11 = 1 / s0 ** 2;
	const a12 = 1 / s0;
	const a21 = 1 / s1 ** 2;
	const a22 = 1 / s1;
	const det = a11 * a22 - a12 * a21;
	const b11 = a22 / det;
	const b12 = -a12 / det;
	const b21 = -a21 / det;
	const b22 = a11 / det;
	return [b11 * h0 + b12 * h1, b21 * h0 + b22 * h1];
}

/** reportlab `_qsolve`: the s for which a/s² + b/s == h, or null. */
function qsolve(h: number, [a, b]: [number, number]): number | null {
	if (Math.abs(a) <= FUZZ) return b / h;
	const t = (0.5 * b) / a;
	const f = -h / a;
	let r = t * t - f;
	if (r < 0) return null;
	r = Math.sqrt(r);
	const s1 = t >= 0 ? -t - r : -t + r;
	const s2 = f / s1;
	return Math.max(1 / s1, 1 / s2);
}

/** reportlab `KeepInFrame(mode="shrink")` holding a single paragraph. */
export class ShrinkToFit {
	width = 0;
	height = 0;
	private scale = 1;

	private readonly content: Paragraph;
	private readonly maxWidth: number;
	private readonly maxHeight: number;

	constructor(content: Paragraph, maxWidth: number, maxHeight: number) {
		this.content = content;
		this.maxWidth = maxWidth;
		this.maxHeight = maxHeight;
	}

	/** `_listWrapOn` for one flowable with `fakeWidth` on: an empty one takes no room. */
	private listWrap(availWidth: number): [number, number] {
		const [w, h] = this.content.wrap(availWidth, 0xfffffff);
		if (h <= FUZZ) return [0, 0];
		return [Math.min(w, availWidth), h];
	}

	wrap(): [number, number] {
		const { maxWidth, maxHeight } = this;
		let [W, H] = this.listWrap(maxWidth);
		if (W <= maxWidth + FUZZ && H <= maxHeight + FUZZ) {
			this.width = W - FUZZ;
			this.height = H - FUZZ;
			return [this.width, this.height];
		}
		const func = (x: number): [number, number] => {
			const [w, h] = this.listWrap(x * maxWidth);
			return [w / x, h / x];
		};
		// The content always wraps to the width it is given, so only height can overflow.
		const s0 = 1;
		const H0 = H;
		const s1 = H / maxHeight;
		[W, H] = func(s1);
		this.width = W - FUZZ;
		this.height = H - FUZZ;
		this.scale = s1;
		if (H < Math.min(0.95 * maxHeight, maxHeight - 10) || H >= maxHeight + FUZZ) {
			const H1 = H;
			for (const f of [0, 0.01, 0.05, 0.1, 0.15]) {
				const s = qsolve(maxHeight * (1 - f), hmodel(s0, s1, H0, H1));
				if (s === null) continue;
				[W, H] = func(s);
				if (H <= maxHeight + FUZZ && W <= maxWidth + FUZZ) {
					this.width = W - FUZZ;
					this.height = H - FUZZ;
					this.scale = s;
					break;
				}
			}
		}
		return [this.width, this.height];
	}

	/** `KeepInFrame.drawOn` → `_Container.drawOn`, which re-wraps the content at the scaled width. */
	drawOn(canvas: Canvas, x: number, y: number): void {
		const scale = this.scale;
		const scaled = scale !== 1;
		if (scaled) {
			canvas.saveState();
			canvas.translate(x, y);
			x = y = 0;
			canvas.scale(1 / scale, 1 / scale);
		}
		const [, h] = this.content.wrap(this.width * scale, 0xfffffff);
		if (h >= FUZZ) this.content.drawOn(canvas, x, y + this.height * scale - h);
		if (scaled) canvas.restoreState();
	}
}
