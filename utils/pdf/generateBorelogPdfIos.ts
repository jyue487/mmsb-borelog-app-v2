import { Block } from '@/interfaces/Block';
import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system';

import { TEXT_SIZE_IOS, TEXT_SIZE_UNIT } from '@/constants/textSize';
import { Borehole } from '@/interfaces/Borehole';
import { Project } from '@/interfaces/Project';
import { generatePdfPages } from './generatePdfPages';

export async function generateBorelogPdfIos(project: Project, borehole: Borehole, blocks: Block[]) {
	const scaleTickIndexWrapper: number[] = [0];
	const asset = Asset.fromModule(require('@/assets/images/mmsb-logo.png'));
	await asset.downloadAsync(); // Ensures it’s saved to a readable path

	console.log(asset.localUri);
	const mmsbLogoBase64: string = await FileSystem.readAsStringAsync(asset.localUri!, {
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
	  padding: 0;
    }

    @media print {
      body {
        width: 210mm;
        box-sizing: border-box;
		margin: 0;
		padding: 0;
      }

      table {
        page-break-inside: avoid;
		border-collapse: collapse;
      }

      h2 {
        text-align: center;
      }

	  .page {
	  	page-break-after: always;
		page-break-inside: avoid;
		width: 210mm;
		padding-top: 5mm;
		padding-left: 15mm;
		padding-right: 5mm;
	  }
    }
    body { font-family: Arial, sans-serif; }
    table {
      border-collapse: collapse;
	  table-layout: fixed;
      width: 100%;
      font-size: ${TEXT_SIZE_IOS}${TEXT_SIZE_UNIT};
    }
    th {
      outline: 0.5pt solid #000;
      padding: 0;
      text-align: center;
      vertical-align: middle;
    }
    td {
      outline: 0.5pt solid #000;
      padding-top: 3pt;
      text-align: center;
      vertical-align: top;
    }
	.page {
		page-break-after: always;
		page-break-inside: avoid;
	}
    .header, .sub-header {
      text-align: left;
      font-weight: bold;
    }
	.header-info {
		display: flex;
		flex-direction: row;
		border-top: 0.5pt solid #000;
		border-left: 0.5pt solid #000;
		border-right: 0.5pt solid #000;
		font-size: 9pt;
	}
	.header-left {
		display: flex;
		flex: 3;
		flex-direction: column;
	}
	.header-right {
		display: flex;
		flex: 2;
		flex-direction: column;
		border-left: 0.5pt solid #000;
		padding: 10pt;
	}
	.header-left-form {
		display: flex;
		flex: 1;
		flex-direction: column;
		padding: 9pt;
		gap: 3pt;
	}
	.header-right-form {
		display: flex;
		flex-direction: column;
		gap: 3pt;
	}
	.header-borehole-name {
		font-size: 15pt;
		font-weight: bold;
	}
	.company-header {
		display: flex;
		flex-direction: row;
		gap: 20pt;
		border-bottom: 0.5pt solid #000;
		align-items: center;
		justify-content: center;
	}
	.company-name {
		font-size: 20pt;
		font-weight: bold;
		text-align: center;
	}
    .description-cell {
      text-align: left;
	  padding-left: 10pt;
	  padding-right: 10pt;
	  font-size: ${TEXT_SIZE_IOS}${TEXT_SIZE_UNIT};
    }
    .no-border {
      border: none;
    }
	.footer-info {
		border-bottom: 0.5pt solid #000;
		border-left: 0.5pt solid #000;
		border-right: 0.5pt solid #000;
		display: flex;
		font-size: 6.5pt;
	}
	.scale {
		padding: 0pt;
	}
	.datetime {
		font-size: 6pt;
	}
  </style>
</head>
<body>
	${generatePdfPages(project, borehole, blocks, scaleTickIndexWrapper, mmsbLogoBase64)}
</body>
</html>


		`
	);
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