import { Asset } from 'expo-asset';
import { File } from 'expo-file-system';
import type { ReportAssets } from '@mmsb/report';

/**
 * Loads the fonts and logo the report embeds, once per session.
 *
 * The old generator re-read both 630 KB TTFs and the 604 KB logo from disk and re-encoded
 * them to base64 on *every* export. These are pre-subsetted (~11 KB per face) and the
 * bytes are cached here, so a second export in the same session does no IO at all.
 */

let cached: Omit<ReportAssets, 'checkerSignature' | 'verifierSignature'> | null = null;

async function loadAssetBytes(moduleRef: number): Promise<Uint8Array> {
	const asset = Asset.fromModule(moduleRef);
	await asset.downloadAsync();
	const uri = asset.localUri ?? asset.uri;
	// Under Metro dev the asset can resolve to an http:// dev-server URI rather than file://,
	// which `new File(...)` cannot read.
	if (uri.startsWith('http://') || uri.startsWith('https://')) {
		const response = await fetch(uri);
		return new Uint8Array(await response.arrayBuffer());
	}
	return await new File(uri).bytes();
}

export async function loadReportAssets(): Promise<Omit<ReportAssets, 'checkerSignature' | 'verifierSignature'>> {
	if (cached !== null) {
		return cached;
	}
	const [fontRegular, fontBold, fontItalic, logoPng] = await Promise.all([
		loadAssetBytes(require('@/assets/fonts/report/NotoSans-Regular.ttf')),
		loadAssetBytes(require('@/assets/fonts/report/NotoSans-Bold.ttf')),
		loadAssetBytes(require('@/assets/fonts/report/NotoSans-Italic.ttf')),
		loadAssetBytes(require('@/assets/images/mmsb-logo-report.png')),
	]);
	cached = { fontRegular, fontBold, fontItalic, logoPng };
	return cached;
}
