/**
 * Runs paragraph cases (text, width, height) through the port's Paragraph and ShrinkToFit
 * and prints, per case, the same summary scripts/paragraphCheck.py prints from reportlab:
 * the lines and their spare width, the height, how `split` divides it, and the shrink
 * scale. Diffing the two is how the wrap is shown to match reportlab's, line for line.
 *
 *   node --import ./scripts/register.mjs scripts/paragraphCheck.ts cases.json > ts.json
 */
import { readFileSync } from 'node:fs';
import { PDFDocument } from 'pdf-lib';

import { Fonts } from '../src/render/canvas.ts';
import { Paragraph, ShrinkToFit } from '../src/render/paragraph.ts';

interface Case {
	text: string;
	w: number;
	h: number;
	size: number;
	leading: number;
	kif?: boolean;
}

type DebugLine = { words: { runs: { text: string }[] }[]; extraSpace: number };
const linesOf = (p: Paragraph) => {
	const lines = (p as unknown as { lines: DebugLine[] | null }).lines;
	return lines === null
		? null
		: lines.map((l) => [l.words.map((w) => w.runs.map((r) => r.text).join('')).join(' '), Math.round(l.extraSpace * 1e4) / 1e4]);
};
const round = (x: number, d: number) => Math.round(x * 10 ** d) / 10 ** d;

const fonts = new Fonts(await PDFDocument.create());
const cases: Case[] = JSON.parse(readFileSync(process.argv[2], 'utf8'));
const out = cases.map((c) => {
	const style = { fontSize: c.size, leading: c.leading };
	if (c.kif) {
		const kif = new ShrinkToFit(new Paragraph(fonts, c.text, style), c.w, c.h);
		const [w, h] = kif.wrap();
		return { kif: [round(w, 3), round(h, 3), round((kif as unknown as { scale: number }).scale, 6)] };
	}
	const p = new Paragraph(fonts, c.text, style);
	const [, h] = p.wrap(c.w, c.h);
	const r: Record<string, unknown> = { lines: linesOf(p), h };
	const p2 = new Paragraph(fonts, c.text, style);
	const parts = p2.split(c.w, c.h);
	r.split = parts.length > 0 && parts[0] === p2 ? 'self' : parts.length;
	if (parts.length > 1) {
		r.p1 = round(parts[0].wrap(c.w, c.h)[1], 4);
		r.p2 = parts[1].wrap(c.w, 1e6)[1] ? linesOf(parts[1]) : null;
	}
	return r;
});
console.log(JSON.stringify(out));
