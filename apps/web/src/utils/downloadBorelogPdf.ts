import type { Block, Borehole } from '@mmsb/core';
import { renderBorelogPdf, type ReportProject, type ReportWarning } from '@mmsb/report';

import { sanitiseFilename } from './sanitiseFilename';

/**
 * Generates the borehole log in the browser and hands it to the user as a download.
 *
 * The same `@mmsb/report` code the field app runs, so the office and the field produce
 * byte-identical PDFs. Closes the "PDF generation on web" deferral in docs/follow-ups.md,
 * which was blocked precisely because the pagination arithmetic lived only inside the
 * mobile generator.
 *
 * IMPORTANT: this module must stay behind a dynamic `import()`. pdf-lib and fontkit are
 * ~1.1 MB of JavaScript; statically imported they land in the main bundle and every page
 * load pays ~500 KB gzipped for a feature most visits never use.
 */

const ASSET_BASE = '/report';

let cachedAssets: {
	fontRegular: Uint8Array;
	fontBold: Uint8Array;
	fontItalic: Uint8Array;
	logoPng: Uint8Array;
} | null = null;

async function fetchBytes(path: string): Promise<Uint8Array> {
	const response = await fetch(path);
	if (!response.ok) {
		throw new Error(`Could not load ${path} (${response.status})`);
	}
	return new Uint8Array(await response.arrayBuffer());
}

async function loadAssets() {
	if (cachedAssets !== null) {
		return cachedAssets;
	}
	const [fontRegular, fontBold, fontItalic, logoPng] = await Promise.all([
		fetchBytes(`${ASSET_BASE}/NotoSans-Regular.ttf`),
		fetchBytes(`${ASSET_BASE}/NotoSans-Bold.ttf`),
		fetchBytes(`${ASSET_BASE}/NotoSans-Italic.ttf`),
		fetchBytes(`${ASSET_BASE}/mmsb-logo.png`),
	]);
	cachedAssets = { fontRegular, fontBold, fontItalic, logoPng };
	return cachedAssets;
}

export async function downloadBorelogPdf(
	project: ReportProject,
	borehole: Borehole,
	blocks: Block[],
): Promise<{ warnings: ReportWarning[]; pageCount: number }> {
	const assets = await loadAssets();

	const { bytes, warnings, pageCount } = await renderBorelogPdf(
		{ project, borehole, blocks },
		{
			...assets,
			signature: borehole.verifierSignatureBase64.length > 0 ? borehole.verifierSignatureBase64 : null,
		},
	);

	const url = URL.createObjectURL(new Blob([bytes as BlobPart], { type: 'application/pdf' }));
	try {
		const anchor = document.createElement('a');
		anchor.href = url;
		anchor.download = `${sanitiseFilename(project.title)}-${sanitiseFilename(borehole.name)}.pdf`;
		anchor.click();
	} finally {
		URL.revokeObjectURL(url);
	}

	return { warnings, pageCount };
}
