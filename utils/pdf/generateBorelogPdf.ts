import { Block } from '@/interfaces/Block';
import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system';

import { generatePdfPages } from './generatePdfPages';
import { TEXT_SIZE } from '@/constants/textSize';

export async function generateBorelogPdf(blocks: Block[]) {
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
		width: 210mm;
		padding-top: 5mm;
		padding-left: 15mm;
		padding-right: 5mm;
	  }
    }
    body { font-family: Arial, sans-serif; }
    table {
      border-collapse: collapse;
      width: 100%;
      font-size: ${TEXT_SIZE};
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
		display: flex;
		flex-direction: column;
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
	  font-size: ${TEXT_SIZE};
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
	${generatePdfPages(blocks, scaleTickIndexWrapper, mmsbLogoBase64)}
</body>
</html>


		`
	);
}
