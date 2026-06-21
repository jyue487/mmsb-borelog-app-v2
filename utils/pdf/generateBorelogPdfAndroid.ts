import { Platform } from 'react-native';
import { Block } from '@/interfaces/Block';
import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system';

import { Borehole } from '@/interfaces/Borehole';
import { Project } from '@/interfaces/Project';
import { generatePdfPages } from './generatePdfPages';
import { throwError } from '../error/throwError';

export async function generateBorelogPdfAndroid(project: Project, borehole: Borehole, blocks: Block[]) {
	const scaleTickIndexWrapper: number[] = [0];
	const asset: Asset = await Asset.fromModule(require('@/assets/images/mmsb-logo.png')).downloadAsync(); // Ensures it’s saved to a readable path
	const regularFontAsset = await Asset.fromModule(require('@/assets/fonts/NotoSans-Regular.ttf')).downloadAsync();
	const boldFontAsset = await Asset.fromModule(require('@/assets/fonts/NotoSans-Bold.ttf')).downloadAsync();
	const regularFontBase64 = await FileSystem.readAsStringAsync(
		regularFontAsset.localUri ?? regularFontAsset.uri,
		{ encoding: FileSystem.EncodingType.Base64 }
	);
	const boldFontBase64 = await FileSystem.readAsStringAsync(
		boldFontAsset.localUri ?? boldFontAsset.uri,
		{ encoding: FileSystem.EncodingType.Base64 }
	);

	try {
		const cachePath = `${FileSystem.cacheDirectory}${asset.name}`;
		await FileSystem.copyAsync({
			from: asset.localUri ?? asset.uri,
			to: cachePath,
		});

		const mmsbLogoBase64: string = await FileSystem.readAsStringAsync(cachePath, {
			encoding: FileSystem.EncodingType.Base64,
		});

		return (
			`
	<!DOCTYPE html>
	<html lang="en">
	<head>
	<meta charset="UTF-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
	<title>Borehole Log</title>
	<style>
		@page {
			size: A4 portrait;
			margin: 0;
		}

		@font-face {
			font-family: 'ReportFont';
			src: url('data:font/ttf;base64,${regularFontBase64}') format('truetype');
			font-weight: 400;
			font-style: normal;
		}

		@font-face {
			font-family: 'ReportFont';
			src: url('data:font/ttf;base64,${boldFontBase64}') format('truetype');
			font-weight: 700;
			font-style: normal;
		}

		:root {
			--report-font: 'ReportFont' !important;
			--base-font-size: 7pt;
			--base-line-height: 1.15;
			--border: 0.5pt solid #000;
			--page-width: 210mm;
			--page-height: 297mm;
			--page-padding-top: 5mm;
			--page-padding-left: 10mm;
			--page-padding-right: 0mm;
		}

		* {
			box-sizing: border-box;
			margin: 0;
			padding: 0;
			-webkit-text-size-adjust: none !important;
			text-size-adjust: none !important;
			font-family: var(--report-font);
		}

		html, body {
			width: var(--page-width);
			margin: 0;
			padding: 0;
			font-family: var(--report-font);
			font-size: var(--base-font-size);
			line-height: var(--base-line-height);
			font-weight: 400;
			color: #000;
			background: #fff;
			-webkit-text-size-adjust: none !important;
  			text-size-adjust: none !important;
		}

		body {
			print-color-adjust: exact;
			-webkit-print-color-adjust: exact;
		}

		.page {
			width: var(--page-width);
			min-height: var(--page-height);
			page-break-after: always;
			page-break-inside: avoid;
			padding-top: var(--page-padding-top);
			padding-left: var(--page-padding-left);
			padding-right: var(--page-padding-right);
			font-size: var(--base-font-size);
			line-height: var(--base-line-height);
		}

		table {
			width: 100%;
			border-collapse: collapse;
			table-layout: fixed;
			font-size: var(--base-font-size);
			line-height: var(--base-line-height);
		}

		th {
			border: var(--border);
			padding: 0;
			text-align: center;
			vertical-align: middle;
			font-weight: 700;
		}

		td {
			border: var(--border);
			padding-top: 3pt;
			text-align: center;
			vertical-align: top;
			font-weight: 400;
		}

		h2 {
			text-align: center;
			font-size: var(--base-font-size);
			line-height: var(--base-line-height);
			font-weight: 700;
		}

		.header,
		.sub-header {
			text-align: left;
			font-weight: 700;
		}

		.description-cell {
			text-align: left;
			padding-left: 10pt;
			padding-right: 10pt;
			font-size: var(--base-font-size);
			line-height: var(--base-line-height);
		}

		.no-border {
			border: none;
		}

		@media print {
			html, body {
			width: var(--page-width);
			height: auto;
			}

			.page:last-child {
			page-break-after: auto;
			}
		}
		</style>
	</head>
	<body>
		${generatePdfPages(project, borehole, blocks, scaleTickIndexWrapper, mmsbLogoBase64)}
	</body>
	</html>


			`
		);
	} catch (err) {
		throwError(`${err}. Local URI: ${asset.localUri}. URI: ${asset.uri}.`);
	}
}

/*
			<table>
				<tr>
					<th rowspan="4" style="width: 5%;">
						<div style="display: flex; height: 100%; width: 100%; align-items: center; justify-content: center; writing-mode: vertical-lr; transform: rotate(180deg); white-space: nowrap;">DATE & TIME</div>
					</th>
					<th rowspan="4" style="width: 5%;">SAMPLING<br><br>TESTING<br><br>CORING</th>
					<th rowspan="3" style="width: 7%;">
						<div style="display: flex; height: 100%; width: 100%; align-items: center; justify-content: center; writing-mode: vertical-lr; transform: rotate(180deg); white-space: nowrap;">
							DEPTH
						</div>
					</th>
					<th rowspan="4" style="width: 5%;">
						<div style="display: flex; height: 100%; width: 100%; align-items: center; justify-content: center; writing-mode: vertical-lr; transform: rotate(180deg); white-space: nowrap;">
							WATER LEVEL
						</div>
					</th>
					<th rowspan="4">DESCRIPTION</th>
					<th rowspan="3" style="width: 4%;">
						<div style="display: flex; height: 100%; width: 100%; align-items: center; justify-content: center; writing-mode: vertical-lr; transform: rotate(180deg); white-space: nowrap;">
							THICKNESS
						</div>
					</th>
					<th colspan="6" style="width: 24%;">SPT</th>
					<th rowspan="4" style="width: 4%;">SPT<br>(N)</th>
					<th rowspan="3" style="width: 5%;">R/r</th>
					<th rowspan="3" style="width: 4%;">
						<div style="display: flex; height: 100%; width: 100%; align-items: center; justify-content: center; writing-mode: vertical-lr; transform: rotate(180deg); white-space: nowrap;">
							SCALE
						</div>
					</th>
				</tr>
				<tr>
					<th>75mm</th>
					<th>75mm</th>
					<th>75mm</th>
					<th>75mm</th>
					<th>75mm</th>
					<th>75mm</th>
				</tr>
				<tr>
					<th colspan="2" style="transform: rotate(270deg); height: 40px;">CORE<br/>RUN</th>
					<th colspan="2" style="transform: rotate(270deg); height: 40px;">R.Q.D.</th>
					<th colspan="2" style="transform: rotate(270deg); height: 40px;">C.R.</th>
				</tr>
				<tr>
					<th>m</th>
					<th>m</th>
					<th colspan="2">m</th>
					<th colspan="2">%</th>
					<th colspan="2">%</th>
					<th>%</th>
					<th>m</th>
				</tr>
			</table>
 */