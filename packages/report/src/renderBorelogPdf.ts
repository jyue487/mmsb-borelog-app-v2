import { PDFDocument } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';

import { buildReportDoc } from './build/buildReportDoc';
import type { ReportDoc, ReportWarning } from './model/doc';
import type { ReportInput } from './model/input';
import { renderReportDoc, type ReportAssets } from './render/pdfLibBackend';
import { createPdfLibMeasurer } from './render/pdfLibMeasurer';

/**
 * The one call a host needs: input plus asset bytes in, PDF bytes out.
 *
 * Both apps previously had to import pdf-lib themselves just to embed the fonts a measurer
 * needs, which leaked a rendering detail into two call sites and duplicated the setup. The
 * hosts' job is loading bytes and doing something with the result; everything between is
 * this package's.
 */

export interface RenderBorelogPdfResult {
	bytes: Uint8Array;
	warnings: ReportWarning[];
	pageCount: number;
	/** Exposed for snapshot tooling; hosts can ignore it. */
	doc: ReportDoc;
}

export async function renderBorelogPdf(
	input: ReportInput,
	assets: ReportAssets,
): Promise<RenderBorelogPdfResult> {
	// Measuring needs embedded fonts and embedding needs a document, so a scratch document
	// produces the measurer before the real one is built.
	const scratch = await PDFDocument.create();
	scratch.registerFontkit(fontkit);
	const measurer = createPdfLibMeasurer({
		regular: await scratch.embedFont(assets.fontRegular, { subset: false }),
		bold: await scratch.embedFont(assets.fontBold, { subset: false }),
		italic: await scratch.embedFont(assets.fontItalic, { subset: false }),
	});

	// Pagination assumes depth order; the callers sort too, but this keeps the guarantee
	// with the code that depends on it.
	const sortedBlocks = [...input.blocks].sort((a, b) => a.topDepthInMetres - b.topDepthInMetres);

	const doc = buildReportDoc({ ...input, blocks: sortedBlocks }, measurer);
	const bytes = await renderReportDoc(doc, assets);

	return { bytes, warnings: doc.warnings, pageCount: doc.pages.length, doc };
}
