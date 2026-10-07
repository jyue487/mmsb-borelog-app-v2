import type { AgsBorehole, AgsProject } from '@mmsb/ags-excel';
import { agsTemplateFileName, fillAgsWorkbook } from '@mmsb/ags-excel';

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
 *
 * Which template depends on the project: clients on a 100-blow SPT main drive get
 * `template-SPT100.xlsx`, whose refusal formulas test 100 rather than 50.
 */

const cachedTemplates = new Map<string, Uint8Array>();

async function loadTemplate(projectCode: string): Promise<Uint8Array> {
	const url = `/ags/${agsTemplateFileName(projectCode)}`;
	const cached = cachedTemplates.get(url);
	if (cached !== undefined) {
		return cached;
	}

	const response = await fetch(url);
	if (!response.ok) {
		throw new Error(`Could not load the AGS template (${response.status}).`);
	}

	const bytes = new Uint8Array(await response.arrayBuffer());
	cachedTemplates.set(url, bytes);
	return bytes;
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

	const bytes = fillAgsWorkbook(await loadTemplate(project.code), { project, boreholes });

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
