import { PDFDocument, type PDFImage } from 'pdf-lib';

import type { BorelogData } from './model';
import { Canvas, Fonts } from './render/canvas';
import { NUM_METRES_PER_PAGE } from './render/config';
import { drawBody, drawColumnHeader, drawFooter, drawOuterFrame } from './render/drawBody';
import { CoreDrawer, GeologyDrawer, ProgressDrawer, SampleDrawer, SptGraphDrawer } from './render/drawers';
import { drawHeader } from './render/drawHeader';
import * as cfg from './render/config';

/** The legend every unknown code falls back to, as `assets/legends/999.png` did. */
export const FALLBACK_LEGEND_CODE = '999';

export interface BorelogAssets {
	companyLogo: Uint8Array;
	footerLogo: Uint8Array;
	/**
	 * Legend pattern PNGs by code. Only the codes `legendCodesFor` names need be present,
	 * plus `999`, which any missing code is drawn with.
	 */
	legends: ReadonlyMap<string, Uint8Array>;
}

/** The legend codes a borelog draws, so a host can fetch only those PNGs (and `999`). */
export function legendCodesFor(data: BorelogData): string[] {
	return [...new Set(data.geology.map((g) => g.legendCode).filter((code) => code !== ''))];
}

/**
 * Pinned so identical input renders identical bytes — pdf-lib otherwise stamps the
 * current time. Same value as the fieldlog's (packages/fieldlog/src/render/pdfLibBackend.ts).
 */
const FIXED_TIMESTAMP = new Date(Date.UTC(2000, 0, 1));

/** The SPT graph's axis when D13 is blank: the Python program's fixed 0–50. */
export const DEFAULT_SPT_N_MAX = 50;

/**
 * SPT-N Max sets the SPT graph's axis. A workbook from a template older than
 * `template_v2.xlsx` has no D13 at all, and is drawn to 50 as it always was. A filled one must
 * be a multiple of 50, which keeps the axis labels whole (they step by a tenth of it every 10
 * ticks).
 */
function resolveSptNMax(sptNMax: number | null): number {
	if (sptNMax === null) return DEFAULT_SPT_N_MAX;
	if (!(sptNMax > 0 && sptNMax % 50 === 0)) {
		throw new Error(`SPT-N Max (Project - AGS, cell D13) is ${sptNMax}; it must be a multiple of 50, such as 50 or 100.`);
	}
	return sptNMax;
}

/** `logics/generate_borelog_pdf.py`: one borehole's borelog, as PDF bytes. */
export async function renderBorelog(data: BorelogData, assets: BorelogAssets): Promise<Uint8Array> {
	if (data.progress.length === 0) throw new Error(`Borehole ${data.borehole.id} has no progress rows, so its depth is unknown.`);
	if (data.geology.length === 0) throw new Error(`Borehole ${data.borehole.id} has no geology rows.`);
	const sptNMax = resolveSptNMax(data.project.sptNMax);

	const doc = await PDFDocument.create();
	doc.setCreationDate(FIXED_TIMESTAMP);
	doc.setModificationDate(FIXED_TIMESTAMP);
	doc.setProducer('@mmsb/borelog');
	doc.setCreator('@mmsb/borelog');

	const companyLogo = await doc.embedPng(assets.companyLogo);
	const footerLogo = await doc.embedPng(assets.footerLogo);
	const legendImages = new Map<string, PDFImage>();
	const fallbackBytes = assets.legends.get(FALLBACK_LEGEND_CODE);
	for (const code of legendCodesFor(data)) {
		const bytes = assets.legends.get(code) ?? fallbackBytes;
		if (bytes === undefined) throw new Error(`No legend image for code ${code}, and no fallback ${FALLBACK_LEGEND_CODE}.png.`);
		legendImages.set(code, await doc.embedPng(bytes));
	}
	const legendFor = (code: string) => legendImages.get(code)!;

	const fonts = new Fonts(doc);
	const c = new Canvas(doc, fonts);

	const progressDrawer = new ProgressDrawer(data.progress);
	const sptGraphDrawer = new SptGraphDrawer(data.spt, sptNMax);
	const geologyDrawer = new GeologyDrawer(data.geology, fonts, legendFor);
	const sampleDrawer = new SampleDrawer(data.samples, data.spt);
	const coreDrawer = new CoreDrawer(data.cores);

	const proposedNumPages = Math.ceil(data.progress[data.progress.length - 1].holeDepthInMetres / NUM_METRES_PER_PAGE);
	const numPages = geologyDrawer.hasOverflow(proposedNumPages) ? proposedNumPages + 1 : proposedNumPages;

	for (let pageNumber = 1; pageNumber <= numPages; pageNumber++) {
		const yHeader = drawHeader(c, data.project, data.borehole, numPages, companyLogo);
		progressDrawer.drawOnPage(c, pageNumber);
		geologyDrawer.drawOnPage(c, pageNumber);
		coreDrawer.drawOnPage(c, pageNumber);
		sampleDrawer.drawOnPage(c, pageNumber);
		const yColumnHeader = drawColumnHeader(c, cfg.LEFT_MARGIN, yHeader);
		const yBodyBottom = drawBody(c, yColumnHeader, pageNumber, sptNMax);
		sptGraphDrawer.drawOnPage(c, pageNumber); // last, so the graph sits on top of the grid
		drawFooter(c, yBodyBottom, data.borehole, numPages, footerLogo);
		drawOuterFrame(c);
		c.showPage();
	}

	return doc.save();
}
