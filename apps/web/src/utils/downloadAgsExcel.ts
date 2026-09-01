import type { AgsBorehole, AgsProject } from '@mmsb/ags-excel';
import { fillAgsWorkbook } from '@mmsb/ags-excel';

import { sanitiseFilename } from './sanitiseFilename';

/**
 * Fills the AGS workbook from Supabase data and hands it to the user as a download.
 *
 * The workbook is not generated — a pristine copy of the template is patched in place,
 * because that template's worksheet formulas are the program that turns typed input into
 * the AGS output the borelog report reads. Everything the exporter does not explicitly
 * write is copied through byte for byte.
 *
 * IMPORTANT: this module must stay behind a dynamic `import()`, the same discipline
 * downloadBorelogPdf.ts and downloadBlockPhotosZip.ts keep. It pulls in fflate and, on
 * first use, fetches a 2.4 MB template — neither belongs in the main bundle.
 */

const TEMPLATE_URL = '/ags/template.xlsx';

let cachedTemplate: Uint8Array | null = null;

async function loadTemplate(): Promise<Uint8Array> {
	if (cachedTemplate !== null) {
		return cachedTemplate;
	}

	const response = await fetch(TEMPLATE_URL);
	if (!response.ok) {
		throw new Error(`Could not load the AGS template (${response.status}).`);
	}

	cachedTemplate = new Uint8Array(await response.arrayBuffer());
	return cachedTemplate;
}

/**
 * Names the file the way the existing workbooks are named.
 *
 * Dots are stripped from the stem on purpose: the report's Python takes the output name
 * from `filename.split('.')[0]`, so an interior dot would silently truncate it.
 */
export function agsWorkbookFilename(projectCode: string, boreholeName: string | null): string {
	const stem =
		boreholeName === null
			? `MMSB Borehole AGS - ${sanitiseFilename(projectCode)}`
			: `MMSB Borehole AGS - ${sanitiseFilename(boreholeName)}`;
	return `${stem.replace(/\./g, '')}.xlsx`;
}

export async function downloadAgsExcel(
	project: AgsProject,
	boreholes: AgsBorehole[],
	filename: string,
): Promise<void> {
	if (boreholes.length === 0) {
		throw new Error('There is nothing to export — this project has no boreholes with data.');
	}

	const bytes = fillAgsWorkbook(await loadTemplate(), { project, boreholes });

	// Same idiom as downloadBorelogPdf.ts.
	const url = URL.createObjectURL(
		new Blob([bytes as BlobPart], {
			type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
		}),
	);

	try {
		const anchor = document.createElement('a');
		anchor.href = url;
		anchor.download = filename;
		anchor.click();
	} finally {
		URL.revokeObjectURL(url);
	}
}
