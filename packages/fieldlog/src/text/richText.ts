import type { FontId } from './measure';

/**
 * The tiny markup vocabulary that description strings already carry.
 *
 * Upstream renderers concatenate HTML into `description` before it is drawn:
 *   - `<i>…</i>` marks an in-situ test description — semantic, not decoration. Six test
 *     renderers wrap their whole description in it; SPT/UD/Coring append
 *     `<br><i>${testBlock.description}</i>` when a test is folded into their row.
 *   - `<br>` separates the host description from the folded test, and end-of-borehole
 *     puts `<br><br>Remarks: …` after its description.
 *
 * This is NOT an HTML parser and must not become one. Those three tags are the entire
 * vocabulary the codebase emits, and user-typed descriptions are not escaped anywhere
 * today — so a description containing a literal `<` already breaks the current HTML
 * output. Treating anything else as text is strictly more correct than the status quo.
 *
 * The better end state is for the row builder to emit structured runs directly and leave
 * this for user-typed content only; parsing exists so the migration does not have to
 * change both ends at once.
 */

export interface RichRun {
	text: string;
	fontId: FontId;
}

export type RichToken =
	| { kind: 'text'; text: string; italic: boolean; bold: boolean }
	| { kind: 'break' };

const MARKUP = /<br\s*\/?>|<\/?i>|<\/?em>|<\/?b>|<\/?strong>/gi;

export function parseRichText(source: string): RichToken[] {
	const tokens: RichToken[] = [];
	let italicDepth = 0;
	let boldDepth = 0;
	let cursor = 0;

	const pushText = (text: string) => {
		if (text.length > 0) {
			tokens.push({ kind: 'text', text, italic: italicDepth > 0, bold: boldDepth > 0 });
		}
	};

	for (const match of source.matchAll(MARKUP)) {
		pushText(source.slice(cursor, match.index));
		cursor = match.index + match[0].length;

		const tag = match[0].toLowerCase();
		if (tag.startsWith('<br')) {
			tokens.push({ kind: 'break' });
		} else if (tag === '<i>' || tag === '<em>') {
			italicDepth += 1;
		} else if (tag === '</i>' || tag === '</em>') {
			italicDepth = Math.max(0, italicDepth - 1);
		} else if (tag === '<b>' || tag === '<strong>') {
			boldDepth += 1;
		} else {
			boldDepth = Math.max(0, boldDepth - 1);
		}
	}
	pushText(source.slice(cursor));

	return tokens;
}

/**
 * Bold and italic together would need a fourth face. The report never asks for it — the
 * only bold is in the static header and footer, never inside a description — so italic
 * wins and the combination is not a supported style.
 */
export function fontIdFor(italic: boolean, bold: boolean): FontId {
	if (italic) {
		return 'italic';
	}
	return bold ? 'bold' : 'regular';
}

export function tokensToPlainText(tokens: RichToken[]): string {
	return tokens.map((token) => (token.kind === 'break' ? '\n' : token.text)).join('');
}
