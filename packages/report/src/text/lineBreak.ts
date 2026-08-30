import type { FontId, TextMeasurer } from './measure';
import { fontIdFor, type RichRun, type RichToken } from './richText';

export interface LaidOutLine {
	runs: RichRun[];
	widthPt: number;
}

/**
 * An indivisible piece of a line: either a word or the whitespace between words. Splitting
 * the token stream into atoms first is what lets a wrap fall inside a styled run — an
 * italic test description can break across lines without losing its style — and what keeps
 * run boundaries from inventing spaces that were not in the source (`abc<i>def</i>` must
 * stay one word).
 */
interface Atom {
	text: string;
	fontId: FontId;
	isSpace: boolean;
}

function toAtoms(tokens: RichToken[]): (Atom | 'break')[] {
	const atoms: (Atom | 'break')[] = [];
	for (const token of tokens) {
		if (token.kind === 'break') {
			atoms.push('break');
			continue;
		}
		const fontId = fontIdFor(token.italic, token.bold);
		for (const piece of token.text.split(/(\s+)/)) {
			if (piece.length > 0) {
				atoms.push({ text: piece, fontId, isSpace: /^\s+$/.test(piece) });
			}
		}
	}
	return atoms;
}

/** Adjacent atoms of the same style become one run, so the backend issues fewer draw calls. */
function coalesce(atoms: Atom[], measurer: TextMeasurer, sizePt: number): LaidOutLine {
	const runs: RichRun[] = [];
	for (const atom of atoms) {
		const last = runs[runs.length - 1];
		if (last !== undefined && last.fontId === atom.fontId) {
			last.text += atom.text;
		} else {
			runs.push({ text: atom.text, fontId: atom.fontId });
		}
	}
	const widthPt = runs.reduce((sum, run) => sum + measurer.widthOf(run.text, run.fontId, sizePt), 0);
	return { runs, widthPt };
}

/**
 * Split a single atom that cannot fit on a line by itself — a long unbroken rock code, or
 * a pasted string with no spaces. Without this the greedy loop would emit an overflowing
 * line and the text would run outside its cell.
 */
function splitOversizedAtom(
	atom: Atom,
	maxWidthPt: number,
	measurer: TextMeasurer,
	sizePt: number,
): Atom[] {
	const pieces: Atom[] = [];
	let current = '';
	for (const char of atom.text) {
		const candidate = current + char;
		if (current !== '' && measurer.widthOf(candidate, atom.fontId, sizePt) > maxWidthPt) {
			pieces.push({ text: current, fontId: atom.fontId, isSpace: false });
			current = char;
		} else {
			current = candidate;
		}
	}
	if (current !== '') {
		pieces.push({ text: current, fontId: atom.fontId, isSpace: false });
	}
	return pieces;
}

export function breakIntoLines(
	tokens: RichToken[],
	maxWidthPt: number,
	sizePt: number,
	measurer: TextMeasurer,
): LaidOutLine[] {
	const lines: LaidOutLine[] = [];
	let current: Atom[] = [];
	let currentWidth = 0;

	const flush = () => {
		// Trailing spaces do not affect where the line ends visually, and keeping them would
		// make a right-aligned cell look wrong.
		while (current.length > 0 && current[current.length - 1].isSpace) {
			current.pop();
		}
		lines.push(coalesce(current, measurer, sizePt));
		current = [];
		currentWidth = 0;
	};

	for (const atom of toAtoms(tokens)) {
		if (atom === 'break') {
			flush();
			continue;
		}

		// A space at the start of a line is a leftover from the wrap that just happened.
		if (atom.isSpace && current.length === 0) {
			continue;
		}

		const atomWidth = measurer.widthOf(atom.text, atom.fontId, sizePt);

		if (currentWidth + atomWidth <= maxWidthPt) {
			current.push(atom);
			currentWidth += atomWidth;
			continue;
		}

		if (current.length > 0) {
			flush();
			if (atom.isSpace) {
				continue;
			}
		}

		// The atom is alone on a fresh line and still too wide.
		if (measurer.widthOf(atom.text, atom.fontId, sizePt) > maxWidthPt) {
			const pieces = splitOversizedAtom(atom, maxWidthPt, measurer, sizePt);
			for (let i = 0; i < pieces.length; i++) {
				current.push(pieces[i]);
				currentWidth += measurer.widthOf(pieces[i].text, pieces[i].fontId, sizePt);
				if (i < pieces.length - 1) {
					flush();
				}
			}
			continue;
		}

		current.push(atom);
		currentWidth += atomWidth;
	}

	flush();

	// A single empty line means there was no content at all.
	if (lines.length === 1 && lines[0].runs.length === 0) {
		return [];
	}
	return lines;
}
