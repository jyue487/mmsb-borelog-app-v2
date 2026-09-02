import { PDFDocument, degrees, rgb, type PDFFont, type PDFImage } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';

import type { DrawNode, ReportDoc, TextLine } from '../model/doc';
import type { HAlign, VAlign } from '../model/table';
import type { FontId, TextMeasurer } from '../text/measure';
import { createPdfLibMeasurer } from './pdfLibMeasurer';

/**
 * The only pdf-lib-aware drawing code. Consumes a ReportDoc and emits PDF bytes.
 *
 * Everything above this file is platform-free and snapshot-testable; everything
 * device-dependent about the old renderer lived in the gap this file closes.
 */

/** Bytes, or a base64 / data-URI string — pdf-lib accepts both. */
export type AssetBytes = Uint8Array | string;

export interface ReportAssets {
	fontRegular: AssetBytes;
	fontBold: AssetBytes;
	fontItalic: AssetBytes;
	logoPng: AssetBytes;
	/** `borehole.verifierSignatureBase64`; may be empty. */
	signature: AssetBytes | null;
}

const BLACK = rgb(0, 0, 0);

/**
 * The model authors top-left with y downward; PDF is bottom-left with y upward. The flip
 * happens here and nowhere else.
 */
function flipY(doc: ReportDoc, y: number): number {
	return doc.pageHeightPt - y;
}

function lineWidthOf(textLine: TextLine, measurer: TextMeasurer): number {
	return textLine.runs.reduce((sum, r) => sum + measurer.widthOf(r.text, r.fontId, r.sizePt), 0);
}

function alignOffset(align: HAlign, boxWidth: number, contentWidth: number): number {
	if (align === 'center') return (boxWidth - contentWidth) / 2;
	if (align === 'right') return boxWidth - contentWidth;
	return 0;
}

function valignOffset(valign: VAlign, boxHeight: number, contentHeight: number): number {
	if (valign === 'middle') return Math.max(0, (boxHeight - contentHeight) / 2);
	if (valign === 'bottom') return Math.max(0, boxHeight - contentHeight);
	return 0;
}

async function embedImage(doc: PDFDocument, asset: AssetBytes): Promise<PDFImage> {
	// A signature arrives as a data URI whose type we do not control.
	if (typeof asset === 'string' && /^data:image\/jpe?g/i.test(asset)) {
		return doc.embedJpg(asset);
	}
	if (asset instanceof Uint8Array && asset[0] === 0xff && asset[1] === 0xd8) {
		return doc.embedJpg(asset);
	}
	return doc.embedPng(asset);
}

/**
 * A fixed timestamp for the document's metadata.
 *
 * pdf-lib stamps CreationDate and ModDate with `new Date()` unless they are set, which made
 * two renders of the same report differ in a couple of hundred bytes and defeated the whole
 * point of `shasum`ing the output across devices. The value is arbitrary — 2000-01-01 UTC —
 * because a borehole log's own dates are drawn on the page, and nothing reads this one.
 * docs/follow-ups.md item 12.
 */
const FIXED_TIMESTAMP = new Date(Date.UTC(2000, 0, 1));

export async function renderReportDoc(doc: ReportDoc, assets: ReportAssets): Promise<Uint8Array> {
	const pdf = await PDFDocument.create();
	pdf.registerFontkit(fontkit);

	// Every input to this function is fixed, so the output should be too.
	pdf.setCreationDate(FIXED_TIMESTAMP);
	pdf.setModificationDate(FIXED_TIMESTAMP);
	pdf.setProducer('@mmsb/report');
	pdf.setCreator('@mmsb/report');

	// subset:false is deliberate — pdf-lib's runtime subsetter mis-maps glyphs for NotoSans.
	// The faces are pre-subsetted offline by scripts/subsetFonts.sh, which is both smaller
	// and metric-identical. See that script for the evidence.
	const fonts: Record<FontId, PDFFont> = {
		regular: await pdf.embedFont(assets.fontRegular, { subset: false }),
		bold: await pdf.embedFont(assets.fontBold, { subset: false }),
		italic: await pdf.embedFont(assets.fontItalic, { subset: false }),
	};
	const measurer = createPdfLibMeasurer(fonts);

	// Embedded once per document and reused on every page. The old renderer inlined the
	// logo's base64 into each page's HTML.
	const images: Partial<Record<'logo' | 'signature', PDFImage>> = {
		logo: await embedImage(pdf, assets.logoPng),
	};
	if (assets.signature !== null && assets.signature !== '') {
		try {
			images.signature = await embedImage(pdf, assets.signature);
		} catch {
			// A malformed signature must not cost the engineer the whole report.
		}
	}

	for (const page of doc.pages) {
		const pdfPage = pdf.addPage([doc.pageWidthPt, doc.pageHeightPt]);

		for (const node of page.nodes) {
			switch (node.kind) {
				case 'line':
					pdfPage.drawLine({
						start: { x: node.x1, y: flipY(doc, node.y1) },
						end: { x: node.x2, y: flipY(doc, node.y2) },
						thickness: node.thicknessPt,
						color: BLACK,
					});
					break;

				case 'rect':
					pdfPage.drawRectangle({
						x: node.x,
						y: flipY(doc, node.y + node.h),
						width: node.w,
						height: node.h,
						borderWidth: node.thicknessPt,
						borderColor: BLACK,
					});
					break;

				case 'image': {
					const image = images[node.imageId];
					if (image === undefined) break;
					// Preserve aspect ratio inside the node's box.
					const scale = Math.min(node.w / image.width, node.h / image.height);
					const w = image.width * scale;
					const h = image.height * scale;
					pdfPage.drawImage(image, {
						x: node.x + (node.w - w) / 2,
						y: flipY(doc, node.y + node.h) + (node.h - h) / 2,
						width: w,
						height: h,
					});
					break;
				}

				case 'text': {
					if (node.lines.length === 0) break;

					if (node.rotate === 90) {
						drawRotatedLine(pdfPage, doc, node, fonts, measurer);
						break;
					}

					const totalHeight = node.lines.length * node.leadingPt;
					const top = node.y + valignOffset(node.valign, node.h, totalHeight);

					node.lines.forEach((textLine, index) => {
						if (textLine.runs.length === 0) return;
						const sizePt = textLine.runs[0].sizePt;
						const capHeight = measurer.capHeightOf(textLine.runs[0].fontId, sizePt);
						// Centre the cap-height box within the line box, so text sits optically
						// centred rather than hanging from an arbitrary offset.
						const baselineY = top + index * node.leadingPt + (node.leadingPt + capHeight) / 2;

						let cursorX = node.x + alignOffset(node.align, node.w, lineWidthOf(textLine, measurer));
						for (const r of textLine.runs) {
							if (r.text !== '') {
								pdfPage.drawText(r.text, {
									x: cursorX,
									y: flipY(doc, baselineY),
									size: r.sizePt,
									font: fonts[r.fontId],
									color: BLACK,
								});
							}
							cursorX += measurer.widthOf(r.text, r.fontId, r.sizePt);
						}
					});
					break;
				}
			}
		}
	}

	return pdf.save();
}

/**
 * The vertical SCALE label.
 *
 * pdf-lib rotates about the (x, y) anchor and the text then runs in +y with glyph tops
 * facing -x, so centring inside a box needs explicit anchor arithmetic rather than an
 * alignment flag.
 */
function drawRotatedLine(
	pdfPage: ReturnType<PDFDocument['addPage']>,
	doc: ReportDoc,
	node: Extract<DrawNode, { kind: 'text' }>,
	fonts: Record<FontId, PDFFont>,
	measurer: TextMeasurer,
): void {
	const textLine = node.lines[0];
	if (textLine === undefined || textLine.runs.length === 0) return;
	const r = textLine.runs[0];

	const textWidth = measurer.widthOf(r.text, r.fontId, r.sizePt);
	const capHeight = measurer.capHeightOf(r.fontId, r.sizePt);

	const centreX = node.x + node.w / 2;
	const centreYPdf = flipY(doc, node.y + node.h / 2);

	pdfPage.drawText(r.text, {
		x: centreX + capHeight / 2,
		y: centreYPdf - textWidth / 2,
		size: r.sizePt,
		font: fonts[r.fontId],
		color: BLACK,
		rotate: degrees(90),
	});
}
