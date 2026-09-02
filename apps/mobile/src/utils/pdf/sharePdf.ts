import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { renderBorelogPdf, type ReportWarning } from '@mmsb/report';

import { Block, Borehole } from '@mmsb/core';
import { Project } from '@/src/interfaces/Project';
import { loadReportAssets } from './loadReportAssets';

/**
 * Generates the borehole log and hands it to the share sheet.
 *
 * Layout and drawing both live in `@mmsb/report`, which is platform-free — so this file is
 * only asset loading, file IO and sharing, and the web dashboard produces a byte-identical
 * PDF from the same code. No WebView and no `expo-print` in the path.
 *
 * The previous HTML pipeline is still present as `sharePdfLegacyHtml.ts` while this one is
 * validated against real boreholes; see that file's header for how to switch back.
 */

export interface SharePdfResult {
	warnings: ReportWarning[];
	pageCount: number;
}

/**
 * Project title and borehole name go straight into a file path, so anything that would make
 * the URI invalid has to come out first.
 */
function sanitiseFilename(value: string): string {
	return value
		.toUpperCase()
		.replace(/[/\\:*?"<>|]/g, '-')
		.replace(/\s+/g, ' ')
		.trim();
}

export async function sharePdf(
	project: Project,
	borehole: Borehole,
	blocks: Block[],
): Promise<SharePdfResult> {
	const assets = await loadReportAssets();

	const { bytes, warnings, pageCount } = await renderBorelogPdf(
		{
			project: {
				title: project.title,
				location: project.location,
				client: project.client,
				consultant: project.consultant,
			},
			borehole,
			blocks,
		},
		{
			...assets,
			signature: borehole.verifierSignatureBase64.length > 0 ? borehole.verifierSignatureBase64 : null,
		},
	);

	const filename = `${sanitiseFilename(project.title)}-${sanitiseFilename(borehole.name)}.pdf`;
	const file = new File(Paths.document, filename);
	file.create({ overwrite: true });
	file.write(bytes);

	if (!(await Sharing.isAvailableAsync())) {
		throw new Error('Sharing is not available on this device.');
	}
	await Sharing.shareAsync(file.uri, { mimeType: 'application/pdf', UTI: 'com.adobe.pdf' });

	return { warnings, pageCount };
}

/**
 * Turns warnings into something a field engineer can act on. `descriptionClipped` is the
 * one that matters: it means a description was too long for its depth interval and was
 * truncated, which is a data problem that can be fixed on the spot.
 */
export function describeWarnings(warnings: ReportWarning[]): string | null {
	if (warnings.length === 0) {
		return null;
	}
	const parts: string[] = [];

	const clipped = warnings.filter((warning) => warning.kind === 'descriptionClipped');
	if (clipped.length > 0) {
		const pages = [...new Set(clipped.map((warning) => warning.pageNumber))].join(', ');
		parts.push(
			`${clipped.length} description${clipped.length === 1 ? ' was' : 's were'} too long to fit and got cut short (sheet ${pages}). Shorten the text or split the interval.`,
		);
	}

	const depths = warnings.filter((warning) => warning.kind === 'negativeBlockHeight');
	if (depths.length > 0) {
		parts.push(`${depths.length} block(s) overlap the block above them — check the depths.`);
	}

	return parts.length > 0 ? parts.join('\n\n') : null;
}
