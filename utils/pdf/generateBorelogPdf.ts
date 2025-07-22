import { Block } from '@/types/Block';
import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system';

import { generatePdfPages } from './generatePdfPages';

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
      margin: 5mm;
    }

    @media print {
      body {
        width: 210mm;
        height: 297mm;
        margin: 0;
        padding: 0;
        box-sizing: border-box;
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
		padding: 5mm;
	  }
    }
    body { font-family: Arial, sans-serif; }
    table {
      border-collapse: collapse;
      width: 100%;
      font-size: 8px;
    }
    th {
      border: 1px solid #000;
      padding: 0px;
      text-align: center;
      vertical-align: middle;
    }
    td {
      border: 1px solid #000;
      padding-top: 5px;
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
		border-top: 1px solid #000;
		border-left: 1px solid #000;
		border-right: 1px solid #000;
		font-size: 9px;
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
		border-left: 1px solid #000;
		padding: 10px;
	}
	.header-left-form {
		display: flex;
		flex: 1;
		flex-direction: column;
		padding: 10px;
		gap: 3px;
	}
	.header-right-form {
		display: flex;
		flex-direction: column;
		gap: 3px;
	}
	.header-borehole-name {
		font-size: 20px;
		font-weight: bold;
	}
	.company-header {
		display: flex;
		flex-direction: row;
		gap: 20px;
		border-bottom: 1px solid #000;
		align-items: center;
		justify-content: center;
	}
	.company-name {
		font-size: 25px;
		font-weight: bold;
		text-align: center;
	}
    .description-cell {
      text-align: left;
	  padding-left: 10px;
	  padding-right: 10px;
    }
    .no-border {
      border: none;
    }
	.footer-info {
		border-bottom: 1px solid #000;
		border-left: 1px solid #000;
		border-right: 1px solid #000;
		display: flex;
		font-size: 8px;
	}
	.scale {
		padding: 0px;
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

/*
export async function generateBorelogPdf(blocks: Block[]) {
	const scaleTickIndexWrapper: number[] = [0];
	const asset = Asset.fromModule(require('@/assets/images/mmsb-logo.png'));
	await asset.downloadAsync(); // Ensures it’s saved to a readable path

	console.log(asset.localUri);
	const mmsbLogoBase64 = await FileSystem.readAsStringAsync(asset.localUri!, {
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
	  margin: 5mm;
    }

    @media print {
      body {
        width: 210mm;
        height: 297mm;
        margin: 0;
        padding: 0;
        box-sizing: border-box;
		overflow: hidden
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
		padding: 5mm;
	  }
    }
    body { font-family: Arial, sans-serif; }
    table {
      border-collapse: collapse;
      width: 100%;
      font-size: 8px;
    }
    th {
      border: 1px solid #000;
      padding: 0px;
      text-align: center;
      vertical-align: middle;
    }
    td {
      border-top: 1px solid #000;
      border-left: 1px solid #000;
      border-right: 1px solid #000;
      padding-top: 5px;
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
		border-top: 1px solid #000;
		border-left: 1px solid #000;
		border-right: 1px solid #000;
		font-size: 9px;
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
		border-left: 1px solid #000;
		padding: 10px;
	}
	.header-left-form {
		display: flex;
		flex: 1;
		flex-direction: column;
		padding: 10px;
		gap: 3px;
	}
	.header-right-form {
		display: flex;
		flex-direction: column;
		gap: 3px;
	}
	.header-borehole-name {
		font-size: 20px;
		font-weight: bold;
	}
	.company-header {
		display: flex;
		flex-direction: row;
		gap: 20px;
		border-bottom: 1px solid #000;
		align-items: center;
		justify-content: center;
	}
	.company-name {
		font-size: 25px;
		font-weight: bold;
		text-align: center;
	}
    .description-cell {
    	text-align: left;
		padding-left: 10px;
		padding-right: 10px;
    }
    .no-border {
    	border: none;
    }
	.footer-info {
		border: 1px solid #000;
		display: flex;
		font-size: 8px;
	}
	.scale {
		border-top: 1px solid #000;
		border-left: 1px solid #000;
		border-right: 1px solid #000;
		padding: 0px;
	}
  </style>
</head>
<body>
	<div class="page">
		<div class="header-info">
			<div class="header-left">
				<div class="company-header">
					<img src="data:image/png;base64,${mmsbLogoBase64}" alt="" width="auto" height="30">
					<div class="company-name">MAXI MEKAR SDN BHD</div>
				</div>
				<div class="header-left-form">
					<div style="display: flex; flex-direction: row;">
						<div style="white-space: pre;">PROJECT: </div>
						<div style="font-weight: bold;">Proposed SI works (Ph1 & Ph2) bagi Cadangan Pembangunan..….di atas Lot 3451, Lot3420, Lot1442, Lot1383, Lot 1444...AAAAAAAAAAAA</div>
					</div>
					<div style="display: flex; flex-direction: row;">
						<div style="white-space: pre;">LOCATION: </div>
						<div style="font-weight: bold;">Mukim Rawang, Daerah Gombak</div>
					</div>
					<div style="display: flex; flex-direction: row;">
						<div style="white-space: pre;">CLIENT: </div>
						<div style="font-weight: bold;">Gamuda Engineering Sdn Bhd</div>
					</div>
					<div style="display: flex; flex-direction: row;">
						<div style="white-space: pre;">CONSULTANT: </div>
						<div style="font-weight: bold;">Dr. Y. G. Tan Jurutera Perunding Sdn Bhd</div>
					</div>
					<div style="display: flex; flex-direction: row; white-space: pre; align-items: baseline;">BOREHOLE NO:   <div class="header-borehole-name">BH-1</div></div>
				</div>
			</div>
			<div class="header-right">
				<div style="white-space: pre;">       SHEET         of</div>
				<br>
				<div class="header-right-form">
					<div>TYPE OF BORING:___</div>
					<div>TYPE OF RIG:______</div>
					<div>DIA. OF BORING:_____</div>
					<div>GROUND LEVEL:_____</div>
					<div>COORDINATE:_____</div>
				</div>
			</div>
		</div>
		<div>
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
				
				<tr style="height: 60px;">
					<td colspan="1" style="vertical-align: bottom;">
						<div style="display: flex; flex-direction: row;">
							<div style="display: flex; flex: 1%; flex-direction: column; align-items: center; justify-content: flex-end;">
								<div>2025<br>08/26<br>17:00</div>
							</div>
						</div>
					</td>
					<td>
						<div>P1</div>
						<div>D1</div>
					</td>
					<td>
						1.500<br>to<br>1.950
					</td>
					<td></td>
					<td class="description-cell">
						Loose, light grey SAND
					</td>
					<td></td>
					<td>
						<div style="display: flex; flex-direction: column; flex: 1; align-items: center; justify-content: center;">
							<div>12</div>
							<div></div>
						</div>
					</td>
					<td>
						<div style="display: flex; flex-direction: column; flex: 1; align-items: center; justify-content: center;">
							<div>13</div>
							<div style="border-top: 1px solid black;">50mm</div>
						</div>
					</td>
					<td>1</td>
					<td>1</td>
					<td>1</td>
					<td>1</td>
					<td>4</td>
					<td>93.3%</td>
					<td class="scale">
						<div style="display: flex; flex-direction: column; align-items: flex-start;">
							<div style="width: 7px; height: 6px; border-bottom: 1px solid #000;"></div>
							<div style="width: 7px; height: 6px; border-bottom: 1px solid #000;"></div>
							<div style="width: 7px; height: 6px; border-bottom: 1px solid #000;"></div>
							<div style="width: 7px; height: 6px; border-bottom: 1px solid #000;"></div>
							<div style="width: 7px; height: 6px; border-bottom: 1px solid #000;"></div>
							<div style="width: 7px; height: 6px; border-bottom: 1px solid #000;"></div>
							<div style="width: 7px; height: 6px; border-bottom: 1px solid #000;"></div>
							<div style="width: 7px; height: 6px; border-bottom: 1px solid #000;"></div>
							<div style="width: 7px; height: 6px; border-bottom: 1px solid #000;"></div>
							<div style="width: 21px; height: 6px; text-align: right; line-height: 0.7em;">1</div>
						</div>
					</td>
				</tr>
				<tr style="height: 60px;">
					<td colspan="1" style="vertical-align: bottom;">
						<div style="display: flex; flex-direction: row;">
							<div style="display: flex; flex: 1%; flex-direction: column; align-items: center; justify-content: flex-end;">
								<div>2025<br>08/26<br>17:00</div>
							</div>
						</div>
					</td>
					<td>
						<div>P1</div>
						<div>D1</div>
					</td>
					<td>
						1.500<br>to<br>1.950
					</td>
					<td></td>
					<td class="description-cell">
						Loose, light grey SAND
					</td>
					<td></td>
					<td>
						<div style="display: flex; flex-direction: column; flex: 1; align-items: center; justify-content: center;">
							<div>12</div>
							<div></div>
						</div>
					</td>
					<td>
						<div style="display: flex; flex-direction: column; flex: 1; align-items: center; justify-content: center;">
							<div>13</div>
							<div style="border-top: 1px solid black;">50mm</div>
						</div>
					</td>
					<td>1</td>
					<td>1</td>
					<td>1</td>
					<td>1</td>
					<td>4</td>
					<td>93.3%</td>
					<td class="scale">
						<div style="display: flex; flex-direction: column; align-items: flex-start;">
							<div style="width: 7px; height: 6px; border-bottom: 1px solid #000;"></div>
							<div style="width: 7px; height: 6px; border-bottom: 1px solid #000;"></div>
							<div style="width: 7px; height: 6px; border-bottom: 1px solid #000;"></div>
							<div style="width: 7px; height: 6px; border-bottom: 1px solid #000;"></div>
							<div style="width: 7px; height: 6px; border-bottom: 1px solid #000;"></div>
							<div style="width: 7px; height: 6px; border-bottom: 1px solid #000;"></div>
							<div style="width: 7px; height: 6px; border-bottom: 1px solid #000;"></div>
							<div style="width: 7px; height: 6px; border-bottom: 1px solid #000;"></div>
							<div style="width: 7px; height: 6px; border-bottom: 1px solid #000;"></div>
							<div style="width: 21px; height: 6px; text-align: right; line-height: 0.7em;">2</div>
						</div>
					</td>
				</tr>
				<tr style="height: 60px;">
					<td colspan="1" style="vertical-align: bottom;">
						<div style="display: flex; flex-direction: row;">
							<div style="display: flex; flex: 1%; flex-direction: column; align-items: center; justify-content: flex-end;">
								<div>2025<br>08/26<br>17:00</div>
							</div>
						</div>
					</td>
					<td>
						<div>P1</div>
						<div>D1</div>
					</td>
					<td>
						1.500<br>to<br>1.950
					</td>
					<td></td>
					<td class="description-cell">
						Loose, light grey SAND
					</td>
					<td></td>
					<td>
						<div style="display: flex; flex-direction: column; flex: 1; align-items: center; justify-content: center;">
							<div>12</div>
							<div></div>
						</div>
					</td>
					<td>
						<div style="display: flex; flex-direction: column; flex: 1; align-items: center; justify-content: center;">
							<div>13</div>
							<div style="border-top: 1px solid black;">50mm</div>
						</div>
					</td>
					<td>1</td>
					<td>1</td>
					<td>1</td>
					<td>1</td>
					<td>4</td>
					<td>93.3%</td>
					<td class="scale">
						<div style="display: flex; flex-direction: column; align-items: flex-start;">
							<div style="width: 7px; height: 6px; border-bottom: 1px solid #000;"></div>
							<div style="width: 7px; height: 6px; border-bottom: 1px solid #000;"></div>
							<div style="width: 7px; height: 6px; border-bottom: 1px solid #000;"></div>
							<div style="width: 7px; height: 6px; border-bottom: 1px solid #000;"></div>
							<div style="width: 7px; height: 6px; border-bottom: 1px solid #000;"></div>
							<div style="width: 7px; height: 6px; border-bottom: 1px solid #000;"></div>
							<div style="width: 7px; height: 6px; border-bottom: 1px solid #000;"></div>
							<div style="width: 7px; height: 6px; border-bottom: 1px solid #000;"></div>
							<div style="width: 7px; height: 6px; border-bottom: 1px solid #000;"></div>
							<div style="width: 21px; height: 6px; text-align: right; line-height: 0.7em;">3</div>
						</div>
					</td>
				</tr>
				<tr style="height: 60px;">
					<td colspan="1" style="vertical-align: bottom;">
						<div style="display: flex; flex-direction: row;">
							<div style="display: flex; flex: 1%; flex-direction: column; align-items: center; justify-content: flex-end;">
								<div>2025<br>08/26<br>17:00</div>
							</div>
						</div>
					</td>
					<td>
						<div>P1</div>
						<div>D1</div>
					</td>
					<td>
						1.500<br>to<br>1.950
					</td>
					<td></td>
					<td class="description-cell">
						Loose, light grey SAND
					</td>
					<td></td>
					<td>
						<div style="display: flex; flex-direction: column; flex: 1; align-items: center; justify-content: center;">
							<div>12</div>
							<div></div>
						</div>
					</td>
					<td>
						<div style="display: flex; flex-direction: column; flex: 1; align-items: center; justify-content: center;">
							<div>13</div>
							<div style="border-top: 1px solid black;">50mm</div>
						</div>
					</td>
					<td>1</td>
					<td>1</td>
					<td>1</td>
					<td>1</td>
					<td>4</td>
					<td>93.3%</td>
					<td class="scale">
						<div style="display: flex; flex-direction: column; align-items: flex-start;">
							<div style="width: 7px; height: 6px; border-bottom: 1px solid #000;"></div>
							<div style="width: 7px; height: 6px; border-bottom: 1px solid #000;"></div>
							<div style="width: 7px; height: 6px; border-bottom: 1px solid #000;"></div>
							<div style="width: 7px; height: 6px; border-bottom: 1px solid #000;"></div>
							<div style="width: 7px; height: 6px; border-bottom: 1px solid #000;"></div>
							<div style="width: 7px; height: 6px; border-bottom: 1px solid #000;"></div>
							<div style="width: 7px; height: 6px; border-bottom: 1px solid #000;"></div>
							<div style="width: 7px; height: 6px; border-bottom: 1px solid #000;"></div>
							<div style="width: 7px; height: 6px; border-bottom: 1px solid #000;"></div>
							<div style="width: 21px; height: 6px; text-align: right; line-height: 0.7em;">4</div>
						</div>
					</td>
				</tr>
				<tr style="height: 60px;">
					<td colspan="1" style="vertical-align: bottom;">
						<div style="display: flex; flex-direction: row;">
							<div style="display: flex; flex: 1%; flex-direction: column; align-items: center; justify-content: flex-end;">
								<div>2025<br>08/26<br>17:00</div>
							</div>
						</div>
					</td>
					<td>
						<div>P1</div>
						<div>D1</div>
					</td>
					<td>
						1.500<br>to<br>1.950
					</td>
					<td></td>
					<td class="description-cell">
						Loose, light grey SAND
					</td>
					<td></td>
					<td>
						<div style="display: flex; flex-direction: column; flex: 1; align-items: center; justify-content: center;">
							<div>12</div>
							<div></div>
						</div>
					</td>
					<td>
						<div style="display: flex; flex-direction: column; flex: 1; align-items: center; justify-content: center;">
							<div>13</div>
							<div style="border-top: 1px solid black;">50mm</div>
						</div>
					</td>
					<td>1</td>
					<td>1</td>
					<td>1</td>
					<td>1</td>
					<td>4</td>
					<td>93.3%</td>
					<td class="scale">
						<div style="display: flex; flex-direction: column; align-items: flex-start;">
							<div style="width: 7px; height: 6px; border-bottom: 1px solid #000;"></div>
							<div style="width: 7px; height: 6px; border-bottom: 1px solid #000;"></div>
							<div style="width: 7px; height: 6px; border-bottom: 1px solid #000;"></div>
							<div style="width: 7px; height: 6px; border-bottom: 1px solid #000;"></div>
							<div style="width: 7px; height: 6px; border-bottom: 1px solid #000;"></div>
							<div style="width: 7px; height: 6px; border-bottom: 1px solid #000;"></div>
							<div style="width: 7px; height: 6px; border-bottom: 1px solid #000;"></div>
							<div style="width: 7px; height: 6px; border-bottom: 1px solid #000;"></div>
							<div style="width: 7px; height: 6px; border-bottom: 1px solid #000;"></div>
							<div style="width: 21px; height: 6px; text-align: right; line-height: 0.7em;">5</div>
						</div>
					</td>
				</tr>
				<tr style="height: 60px;">
					<td colspan="1" style="vertical-align: bottom;">
						<div style="display: flex; flex-direction: row;">
							<div style="display: flex; flex: 1%; flex-direction: column; align-items: center; justify-content: flex-end;">
								<div>2025<br>08/26<br>17:00</div>
							</div>
						</div>
					</td>
					<td>
						<div>P1</div>
						<div>D1</div>
					</td>
					<td>
						1.500<br>to<br>1.950
					</td>
					<td></td>
					<td class="description-cell">
						Loose, light grey SAND
					</td>
					<td></td>
					<td>
						<div style="display: flex; flex-direction: column; flex: 1; align-items: center; justify-content: center;">
							<div>12</div>
							<div></div>
						</div>
					</td>
					<td>
						<div style="display: flex; flex-direction: column; flex: 1; align-items: center; justify-content: center;">
							<div>13</div>
							<div style="border-top: 1px solid black;">50mm</div>
						</div>
					</td>
					<td>1</td>
					<td>1</td>
					<td>1</td>
					<td>1</td>
					<td>4</td>
					<td>93.3%</td>
					<td class="scale">
						<div style="display: flex; flex-direction: column; align-items: flex-start;">
							<div style="width: 7px; height: 6px; border-bottom: 1px solid #000;"></div>
							<div style="width: 7px; height: 6px; border-bottom: 1px solid #000;"></div>
							<div style="width: 7px; height: 6px; border-bottom: 1px solid #000;"></div>
							<div style="width: 7px; height: 6px; border-bottom: 1px solid #000;"></div>
							<div style="width: 7px; height: 6px; border-bottom: 1px solid #000;"></div>
							<div style="width: 7px; height: 6px; border-bottom: 1px solid #000;"></div>
							<div style="width: 7px; height: 6px; border-bottom: 1px solid #000;"></div>
							<div style="width: 7px; height: 6px; border-bottom: 1px solid #000;"></div>
							<div style="width: 7px; height: 6px; border-bottom: 1px solid #000;"></div>
							<div style="width: 21px; height: 6px; text-align: right; line-height: 0.7em;">6</div>
						</div>
					</td>
				</tr>
				<tr style="height: 60px;">
					<td colspan="1" style="vertical-align: bottom;">
						<div style="display: flex; flex-direction: row;">
							<div style="display: flex; flex: 1%; flex-direction: column; align-items: center; justify-content: flex-end;">
								<div>2025<br>08/26<br>17:00</div>
							</div>
						</div>
					</td>
					<td>
						<div>P1</div>
						<div>D1</div>
					</td>
					<td>
						1.500<br>to<br>1.950
					</td>
					<td></td>
					<td class="description-cell">
						Loose, light grey SAND
					</td>
					<td></td>
					<td>
						<div style="display: flex; flex-direction: column; flex: 1; align-items: center; justify-content: center;">
							<div>12</div>
							<div></div>
						</div>
					</td>
					<td>
						<div style="display: flex; flex-direction: column; flex: 1; align-items: center; justify-content: center;">
							<div>13</div>
							<div style="border-top: 1px solid black;">50mm</div>
						</div>
					</td>
					<td>1</td>
					<td>1</td>
					<td>1</td>
					<td>1</td>
					<td>4</td>
					<td>93.3%</td>
					<td class="scale">
						<div style="display: flex; flex-direction: column; align-items: flex-start;">
							<div style="width: 7px; height: 6px; border-bottom: 1px solid #000;"></div>
							<div style="width: 7px; height: 6px; border-bottom: 1px solid #000;"></div>
							<div style="width: 7px; height: 6px; border-bottom: 1px solid #000;"></div>
							<div style="width: 7px; height: 6px; border-bottom: 1px solid #000;"></div>
							<div style="width: 7px; height: 6px; border-bottom: 1px solid #000;"></div>
							<div style="width: 7px; height: 6px; border-bottom: 1px solid #000;"></div>
							<div style="width: 7px; height: 6px; border-bottom: 1px solid #000;"></div>
							<div style="width: 7px; height: 6px; border-bottom: 1px solid #000;"></div>
							<div style="width: 7px; height: 6px; border-bottom: 1px solid #000;"></div>
							<div style="width: 21px; height: 6px; text-align: right; line-height: 0.7em;">7</div>
						</div>
					</td>
				</tr>
				<tr style="height: 60px;">
					<td colspan="1" style="vertical-align: bottom;">
						<div style="display: flex; flex-direction: row;">
							<div style="display: flex; flex: 1%; flex-direction: column; align-items: center; justify-content: flex-end;">
								<div>2025<br>08/26<br>17:00</div>
							</div>
						</div>
					</td>
					<td>
						<div>P1</div>
						<div>D1</div>
					</td>
					<td>
						1.500<br>to<br>1.950
					</td>
					<td></td>
					<td class="description-cell">
						Loose, light grey SAND
					</td>
					<td></td>
					<td>
						<div style="display: flex; flex-direction: column; flex: 1; align-items: center; justify-content: center;">
							<div>12</div>
							<div></div>
						</div>
					</td>
					<td>
						<div style="display: flex; flex-direction: column; flex: 1; align-items: center; justify-content: center;">
							<div>13</div>
							<div style="border-top: 1px solid black;">50mm</div>
						</div>
					</td>
					<td>1</td>
					<td>1</td>
					<td>1</td>
					<td>1</td>
					<td>4</td>
					<td>93.3%</td>
					<td class="scale">
						<div style="display: flex; flex-direction: column; align-items: flex-start;">
							<div style="width: 7px; height: 6px; border-bottom: 1px solid #000;"></div>
							<div style="width: 7px; height: 6px; border-bottom: 1px solid #000;"></div>
							<div style="width: 7px; height: 6px; border-bottom: 1px solid #000;"></div>
							<div style="width: 7px; height: 6px; border-bottom: 1px solid #000;"></div>
							<div style="width: 7px; height: 6px; border-bottom: 1px solid #000;"></div>
							<div style="width: 7px; height: 6px; border-bottom: 1px solid #000;"></div>
							<div style="width: 7px; height: 6px; border-bottom: 1px solid #000;"></div>
							<div style="width: 7px; height: 6px; border-bottom: 1px solid #000;"></div>
							<div style="width: 7px; height: 6px; border-bottom: 1px solid #000;"></div>
							<div style="width: 21px; height: 6px; text-align: right; line-height: 0.7em;">8</div>
						</div>
					</td>
				</tr>
				<tr style="height: 60px;">
					<td colspan="1" style="vertical-align: bottom;">
						<div style="display: flex; flex-direction: row;">
							<div style="display: flex; flex: 1%; flex-direction: column; align-items: center; justify-content: flex-end;">
								<div>2025<br>08/26<br>17:00</div>
							</div>
						</div>
					</td>
					<td>
						<div>P1</div>
						<div>D1</div>
					</td>
					<td>
						1.500<br>to<br>1.950
					</td>
					<td></td>
					<td class="description-cell">
						Loose, light grey SAND
					</td>
					<td></td>
					<td>
						<div style="display: flex; flex-direction: column; flex: 1; align-items: center; justify-content: center;">
							<div>12</div>
							<div></div>
						</div>
					</td>
					<td>
						<div style="display: flex; flex-direction: column; flex: 1; align-items: center; justify-content: center;">
							<div>13</div>
							<div style="border-top: 1px solid black;">50mm</div>
						</div>
					</td>
					<td>1</td>
					<td>1</td>
					<td>1</td>
					<td>1</td>
					<td>4</td>
					<td>93.3%</td>
					<td class="scale">
						<div style="display: flex; flex-direction: column; align-items: flex-start;">
							<div style="width: 7px; height: 6px; border-bottom: 1px solid #000;"></div>
							<div style="width: 7px; height: 6px; border-bottom: 1px solid #000;"></div>
							<div style="width: 7px; height: 6px; border-bottom: 1px solid #000;"></div>
							<div style="width: 7px; height: 6px; border-bottom: 1px solid #000;"></div>
							<div style="width: 7px; height: 6px; border-bottom: 1px solid #000;"></div>
							<div style="width: 7px; height: 6px; border-bottom: 1px solid #000;"></div>
							<div style="width: 7px; height: 6px; border-bottom: 1px solid #000;"></div>
							<div style="width: 7px; height: 6px; border-bottom: 1px solid #000;"></div>
							<div style="width: 7px; height: 6px; border-bottom: 1px solid #000;"></div>
							<div style="width: 21px; height: 6px; text-align: right; line-height: 0.7em;">9</div>
						</div>
					</td>
				</tr>
				
			</table>
		</div>
		<div class="footer-info">
			<div style="display: flex; flex: 1; flex-direction: column;">
				<div style="display: flex; align-items: center; justify-content: center; height: 2em; border-bottom: 1px solid #000;">NOTES: </div>
				<div style="display: flex; flex-direction: row; padding: 5px;">
					<div style="text-align: right;">
						<div style="white-space: pre;">P </div>
						<div style="white-space: pre;">UD </div>
						<div style="white-space: pre;">PS </div>
						<div style="white-space: pre;">MZ </div>
						<div style="white-space: pre;">D </div>
						<div style="white-space: pre;">VS </div>
						<div style="white-space: pre;">W </div>
						<div style="white-space: pre;">C </div>
					</div>
					<div>
						<div>= Standard Penetration Test (SPT)</div>
						<div>= 50 mm dia. undisturbed sample</div>
						<div>= Piston Sample</div>
						<div>= Mazier Sample</div>
						<div>= Disturbed Sample</div>
						<div>= Vane Shear Test</div>
						<div>= Water Sample</div>
						<div>= Core Sample (Rock)</div>
					</div>
				</div>
			</div>
			<div style="display: flex; flex: 0.8; flex-direction: column; border-left: 1px solid #000">
				<div style="display: flex; align-items: center; justify-content: center; height: 2em; border-bottom: 1px solid #000;">Cohesive Soil (N)</div>
				<div style="display: flex; flex-direction: row; padding: 5px;">
					<div style="text-align: right;">
						<div style="white-space: pre;"> 0</div>
						<div style="white-space: pre;"> 2</div>
						<div style="white-space: pre;"> 4</div>
						<div style="white-space: pre;"> 8</div>
						<div style="white-space: pre;">15</div>
					</div>
					<div style="text-align: center;">
						<div style="white-space: pre;"> - </div>
						<div style="white-space: pre;"> - </div>
						<div style="white-space: pre;"> - </div>
						<div style="white-space: pre;"> - </div>
						<div style="white-space: pre;"> - </div>
						<div style="white-space: pre;"> > </div>
					</div>
					<div>
						<div style="white-space: pre;">2</div>
						<div style="white-space: pre;">4</div>
						<div style="white-space: pre;">8</div>
						<div style="white-space: pre;">15</div>
						<div style="white-space: pre;">30</div>
						<div style="white-space: pre;">30</div>
					</div>
					<div>
						<div style="white-space: pre;">   Very Soft</div>
						<div style="white-space: pre;">   Soft</div>
						<div style="white-space: pre;">   Firm</div>
						<div style="white-space: pre;">   Stiff</div>
						<div style="white-space: pre;">   Very Stiff</div>
						<div style="white-space: pre;">   Hard</div>
					</div>
				</div>
			</div>
			<div style="display: flex; flex: 0.8; flex-direction: column; border-left: 1px solid #000">
				<div style="display: flex; align-items: center; justify-content: center; height: 2em; border-bottom: 1px solid #000;">Non Cohesive Soil (N)</div>
				<div style="display: flex; flex-direction: row; padding: 5px;">
					<div style="text-align: right;">
						<div style="white-space: pre;"> 0</div>
						<div style="white-space: pre;"> 4</div>
						<div style="white-space: pre;">10</div>
						<div style="white-space: pre;">30</div>
					</div>
					<div style="text-align: center;">
						<div style="white-space: pre;"> - </div>
						<div style="white-space: pre;"> - </div>
						<div style="white-space: pre;"> - </div>
						<div style="white-space: pre;"> - </div>
						<div style="white-space: pre;"> > </div>
					</div>
					<div>
						<div style="white-space: pre;">4</div>
						<div style="white-space: pre;">10</div>
						<div style="white-space: pre;">30</div>
						<div style="white-space: pre;">50</div>
						<div style="white-space: pre;">50</div>
					</div>
					<div>
						<div style="white-space: pre;">   Very Loose</div>
						<div style="white-space: pre;">   Loose</div>
						<div style="white-space: pre;">   Medium Dense</div>
						<div style="white-space: pre;">   Dense</div>
						<div style="white-space: pre;">   Very Dense</div>
					</div>
				</div>
			</div>
			<div style="display: flex; flex: 1; flex-direction: column; border-left: 1px solid #000; padding: 5px;">
				<div style="display: flex; flex-direction: column; flex: 1;">Contractor: </div>
				<div style="display: flex; flex-direction: column; flex: 1;">Date Started: </div>
				<div style="display: flex; flex-direction: column; flex: 1;">Date Finished: </div>
			</div>
			<div style="display: flex; flex: 1; flex-direction: column; border-left: 1px solid #000; padding: 5px;">
				<div style="display: flex; flex-direction: column; flex: 1;">Logged by: </div>
				<div style="display: flex; flex-direction: column; flex: 1;">Checked by: </div>
				<div style="display: flex; flex-direction: column; flex: 1;">Date: </div>
			</div>
		</div>
	</div>
	<div class="page">
		<div class="header-info">
			<div class="header-left">
				<div class="company-header">
					<img src="data:image/png;base64,${mmsbLogoBase64}" alt="" width="auto" height="30">
					<div class="company-name">MAXI MEKAR SDN BHD</div>
				</div>
				<div class="header-left-form">
					<div style="display: flex; flex-direction: row;">
						<div style="white-space: pre;">PROJECT: </div>
						<div style="font-weight: bold;">Proposed SI works (Ph1 & Ph2) bagi Cadangan Pembangunan..….di atas Lot 3451, Lot3420, Lot1442, Lot1383, Lot 1444...AAAAAAAAAAAA</div>
					</div>
					<div style="display: flex; flex-direction: row;">
						<div style="white-space: pre;">LOCATION: </div>
						<div style="font-weight: bold;">Mukim Rawang, Daerah Gombak</div>
					</div>
					<div style="display: flex; flex-direction: row;">
						<div style="white-space: pre;">CLIENT: </div>
						<div style="font-weight: bold;">Gamuda Engineering Sdn Bhd</div>
					</div>
					<div style="display: flex; flex-direction: row;">
						<div style="white-space: pre;">CONSULTANT: </div>
						<div style="font-weight: bold;">Dr. Y. G. Tan Jurutera Perunding Sdn Bhd</div>
					</div>
					<div style="display: flex; flex-direction: row; white-space: pre; align-items: baseline;">BOREHOLE NO:   <div class="header-borehole-name">BH-1</div></div>
				</div>
			</div>
			<div class="header-right">
				<div style="white-space: pre;">       SHEET         of</div>
				<br>
				<div class="header-right-form">
					<div>TYPE OF BORING:___</div>
					<div>TYPE OF RIG:______</div>
					<div>DIA. OF BORING:_____</div>
					<div>GROUND LEVEL:_____</div>
					<div>COORDINATE:_____</div>
				</div>
			</div>
		</div>
		<div>
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
				
				<tr style="height: 60px;">
					<td colspan="1" style="vertical-align: bottom;">
						<div style="display: flex; flex-direction: row;">
							<div style="display: flex; flex: 1%; flex-direction: column; align-items: center; justify-content: flex-end;">
								<div>2025<br>08/26<br>17:00</div>
							</div>
						</div>
					</td>
					<td>
						<div>P1</div>
						<div>D1</div>
					</td>
					<td>
						1.500<br>to<br>1.950
					</td>
					<td></td>
					<td class="description-cell">
						Loose, light grey SAND
					</td>
					<td></td>
					<td>
						<div style="display: flex; flex-direction: column; flex: 1; align-items: center; justify-content: center;">
							<div>12</div>
							<div></div>
						</div>
					</td>
					<td>
						<div style="display: flex; flex-direction: column; flex: 1; align-items: center; justify-content: center;">
							<div>13</div>
							<div style="border-top: 1px solid black;">50mm</div>
						</div>
					</td>
					<td>1</td>
					<td>1</td>
					<td>1</td>
					<td>1</td>
					<td>4</td>
					<td>93.3%</td>
					<td class="scale">
						<div style="display: flex; flex-direction: column; align-items: flex-start;">
							<div style="width: 7px; height: 6px; border-bottom: 1px solid #000;"></div>
							<div style="width: 7px; height: 6px; border-bottom: 1px solid #000;"></div>
							<div style="width: 7px; height: 6px; border-bottom: 1px solid #000;"></div>
							<div style="width: 7px; height: 6px; border-bottom: 1px solid #000;"></div>
							<div style="width: 7px; height: 6px; border-bottom: 1px solid #000;"></div>
							<div style="width: 7px; height: 6px; border-bottom: 1px solid #000;"></div>
							<div style="width: 7px; height: 6px; border-bottom: 1px solid #000;"></div>
							<div style="width: 7px; height: 6px; border-bottom: 1px solid #000;"></div>
							<div style="width: 7px; height: 6px; border-bottom: 1px solid #000;"></div>
							<div style="width: 21px; height: 6px; text-align: right; line-height: 0.7em;">1</div>
						</div>
					</td>
				</tr>
				<tr style="height: 60px;">
					<td colspan="1" style="vertical-align: bottom;">
						<div style="display: flex; flex-direction: row;">
							<div style="display: flex; flex: 1%; flex-direction: column; align-items: center; justify-content: flex-end;">
								<div>2025<br>08/26<br>17:00</div>
							</div>
						</div>
					</td>
					<td>
						<div>P1</div>
						<div>D1</div>
					</td>
					<td>
						1.500<br>to<br>1.950
					</td>
					<td></td>
					<td class="description-cell">
						Loose, light grey SAND
					</td>
					<td></td>
					<td>
						<div style="display: flex; flex-direction: column; flex: 1; align-items: center; justify-content: center;">
							<div>12</div>
							<div></div>
						</div>
					</td>
					<td>
						<div style="display: flex; flex-direction: column; flex: 1; align-items: center; justify-content: center;">
							<div>13</div>
							<div style="border-top: 1px solid black;">50mm</div>
						</div>
					</td>
					<td>1</td>
					<td>1</td>
					<td>1</td>
					<td>1</td>
					<td>4</td>
					<td>93.3%</td>
					<td class="scale">
						<div style="display: flex; flex-direction: column; align-items: flex-start;">
							<div style="width: 7px; height: 6px; border-bottom: 1px solid #000;"></div>
							<div style="width: 7px; height: 6px; border-bottom: 1px solid #000;"></div>
							<div style="width: 7px; height: 6px; border-bottom: 1px solid #000;"></div>
							<div style="width: 7px; height: 6px; border-bottom: 1px solid #000;"></div>
							<div style="width: 7px; height: 6px; border-bottom: 1px solid #000;"></div>
							<div style="width: 7px; height: 6px; border-bottom: 1px solid #000;"></div>
							<div style="width: 7px; height: 6px; border-bottom: 1px solid #000;"></div>
							<div style="width: 7px; height: 6px; border-bottom: 1px solid #000;"></div>
							<div style="width: 7px; height: 6px; border-bottom: 1px solid #000;"></div>
							<div style="width: 21px; height: 6px; text-align: right; line-height: 0.7em;">2</div>
						</div>
					</td>
				</tr>
				<tr style="height: 60px;">
					<td colspan="1" style="vertical-align: bottom;">
						<div style="display: flex; flex-direction: row;">
							<div style="display: flex; flex: 1%; flex-direction: column; align-items: center; justify-content: flex-end;">
								<div>2025<br>08/26<br>17:00</div>
							</div>
						</div>
					</td>
					<td>
						<div>P1</div>
						<div>D1</div>
					</td>
					<td>
						1.500<br>to<br>1.950
					</td>
					<td></td>
					<td class="description-cell">
						Loose, light grey SAND
					</td>
					<td></td>
					<td>
						<div style="display: flex; flex-direction: column; flex: 1; align-items: center; justify-content: center;">
							<div>12</div>
							<div></div>
						</div>
					</td>
					<td>
						<div style="display: flex; flex-direction: column; flex: 1; align-items: center; justify-content: center;">
							<div>13</div>
							<div style="border-top: 1px solid black;">50mm</div>
						</div>
					</td>
					<td>1</td>
					<td>1</td>
					<td>1</td>
					<td>1</td>
					<td>4</td>
					<td>93.3%</td>
					<td class="scale">
						<div style="display: flex; flex-direction: column; align-items: flex-start;">
							<div style="width: 7px; height: 6px; border-bottom: 1px solid #000;"></div>
							<div style="width: 7px; height: 6px; border-bottom: 1px solid #000;"></div>
							<div style="width: 7px; height: 6px; border-bottom: 1px solid #000;"></div>
							<div style="width: 7px; height: 6px; border-bottom: 1px solid #000;"></div>
							<div style="width: 7px; height: 6px; border-bottom: 1px solid #000;"></div>
							<div style="width: 7px; height: 6px; border-bottom: 1px solid #000;"></div>
							<div style="width: 7px; height: 6px; border-bottom: 1px solid #000;"></div>
							<div style="width: 7px; height: 6px; border-bottom: 1px solid #000;"></div>
							<div style="width: 7px; height: 6px; border-bottom: 1px solid #000;"></div>
							<div style="width: 21px; height: 6px; text-align: right; line-height: 0.7em;">3</div>
						</div>
					</td>
				</tr>
				<tr style="height: 60px;">
					<td colspan="1" style="vertical-align: bottom;">
						<div style="display: flex; flex-direction: row;">
							<div style="display: flex; flex: 1%; flex-direction: column; align-items: center; justify-content: flex-end;">
								<div>2025<br>08/26<br>17:00</div>
							</div>
						</div>
					</td>
					<td>
						<div>P1</div>
						<div>D1</div>
					</td>
					<td>
						1.500<br>to<br>1.950
					</td>
					<td></td>
					<td class="description-cell">
						Loose, light grey SAND
					</td>
					<td></td>
					<td>
						<div style="display: flex; flex-direction: column; flex: 1; align-items: center; justify-content: center;">
							<div>12</div>
							<div></div>
						</div>
					</td>
					<td>
						<div style="display: flex; flex-direction: column; flex: 1; align-items: center; justify-content: center;">
							<div>13</div>
							<div style="border-top: 1px solid black;">50mm</div>
						</div>
					</td>
					<td>1</td>
					<td>1</td>
					<td>1</td>
					<td>1</td>
					<td>4</td>
					<td>93.3%</td>
					<td class="scale">
						<div style="display: flex; flex-direction: column; align-items: flex-start;">
							<div style="width: 7px; height: 6px; border-bottom: 1px solid #000;"></div>
							<div style="width: 7px; height: 6px; border-bottom: 1px solid #000;"></div>
							<div style="width: 7px; height: 6px; border-bottom: 1px solid #000;"></div>
							<div style="width: 7px; height: 6px; border-bottom: 1px solid #000;"></div>
							<div style="width: 7px; height: 6px; border-bottom: 1px solid #000;"></div>
							<div style="width: 7px; height: 6px; border-bottom: 1px solid #000;"></div>
							<div style="width: 7px; height: 6px; border-bottom: 1px solid #000;"></div>
							<div style="width: 7px; height: 6px; border-bottom: 1px solid #000;"></div>
							<div style="width: 7px; height: 6px; border-bottom: 1px solid #000;"></div>
							<div style="width: 21px; height: 6px; text-align: right; line-height: 0.7em;">4</div>
						</div>
					</td>
				</tr>
				<tr style="height: 60px;">
					<td colspan="1" style="vertical-align: bottom;">
						<div style="display: flex; flex-direction: row;">
							<div style="display: flex; flex: 1%; flex-direction: column; align-items: center; justify-content: flex-end;">
								<div>2025<br>08/26<br>17:00</div>
							</div>
						</div>
					</td>
					<td>
						<div>P1</div>
						<div>D1</div>
					</td>
					<td>
						1.500<br>to<br>1.950
					</td>
					<td></td>
					<td class="description-cell">
						Loose, light grey SAND
					</td>
					<td></td>
					<td>
						<div style="display: flex; flex-direction: column; flex: 1; align-items: center; justify-content: center;">
							<div>12</div>
							<div></div>
						</div>
					</td>
					<td>
						<div style="display: flex; flex-direction: column; flex: 1; align-items: center; justify-content: center;">
							<div>13</div>
							<div style="border-top: 1px solid black;">50mm</div>
						</div>
					</td>
					<td>1</td>
					<td>1</td>
					<td>1</td>
					<td>1</td>
					<td>4</td>
					<td>93.3%</td>
					<td class="scale">
						<div style="display: flex; flex-direction: column; align-items: flex-start;">
							<div style="width: 7px; height: 6px; border-bottom: 1px solid #000;"></div>
							<div style="width: 7px; height: 6px; border-bottom: 1px solid #000;"></div>
							<div style="width: 7px; height: 6px; border-bottom: 1px solid #000;"></div>
							<div style="width: 7px; height: 6px; border-bottom: 1px solid #000;"></div>
							<div style="width: 7px; height: 6px; border-bottom: 1px solid #000;"></div>
							<div style="width: 7px; height: 6px; border-bottom: 1px solid #000;"></div>
							<div style="width: 7px; height: 6px; border-bottom: 1px solid #000;"></div>
							<div style="width: 7px; height: 6px; border-bottom: 1px solid #000;"></div>
							<div style="width: 7px; height: 6px; border-bottom: 1px solid #000;"></div>
							<div style="width: 21px; height: 6px; text-align: right; line-height: 0.7em;">5</div>
						</div>
					</td>
				</tr>
				<tr style="height: 60px;">
					<td colspan="1" style="vertical-align: bottom;">
						<div style="display: flex; flex-direction: row;">
							<div style="display: flex; flex: 1%; flex-direction: column; align-items: center; justify-content: flex-end;">
								<div>2025<br>08/26<br>17:00</div>
							</div>
						</div>
					</td>
					<td>
						<div>P1</div>
						<div>D1</div>
					</td>
					<td>
						1.500<br>to<br>1.950
					</td>
					<td></td>
					<td class="description-cell">
						Loose, light grey SAND
					</td>
					<td></td>
					<td>
						<div style="display: flex; flex-direction: column; flex: 1; align-items: center; justify-content: center;">
							<div>12</div>
							<div></div>
						</div>
					</td>
					<td>
						<div style="display: flex; flex-direction: column; flex: 1; align-items: center; justify-content: center;">
							<div>13</div>
							<div style="border-top: 1px solid black;">50mm</div>
						</div>
					</td>
					<td>1</td>
					<td>1</td>
					<td>1</td>
					<td>1</td>
					<td>4</td>
					<td>93.3%</td>
					<td class="scale">
						<div style="display: flex; flex-direction: column; align-items: flex-start;">
							<div style="width: 7px; height: 6px; border-bottom: 1px solid #000;"></div>
							<div style="width: 7px; height: 6px; border-bottom: 1px solid #000;"></div>
							<div style="width: 7px; height: 6px; border-bottom: 1px solid #000;"></div>
							<div style="width: 7px; height: 6px; border-bottom: 1px solid #000;"></div>
							<div style="width: 7px; height: 6px; border-bottom: 1px solid #000;"></div>
							<div style="width: 7px; height: 6px; border-bottom: 1px solid #000;"></div>
							<div style="width: 7px; height: 6px; border-bottom: 1px solid #000;"></div>
							<div style="width: 7px; height: 6px; border-bottom: 1px solid #000;"></div>
							<div style="width: 7px; height: 6px; border-bottom: 1px solid #000;"></div>
							<div style="width: 21px; height: 6px; text-align: right; line-height: 0.7em;">6</div>
						</div>
					</td>
				</tr>
				<tr style="height: 60px;">
					<td colspan="1" style="vertical-align: bottom;">
						<div style="display: flex; flex-direction: row;">
							<div style="display: flex; flex: 1%; flex-direction: column; align-items: center; justify-content: flex-end;">
								<div>2025<br>08/26<br>17:00</div>
							</div>
						</div>
					</td>
					<td>
						<div>P1</div>
						<div>D1</div>
					</td>
					<td>
						1.500<br>to<br>1.950
					</td>
					<td></td>
					<td class="description-cell">
						Loose, light grey SAND
					</td>
					<td></td>
					<td>
						<div style="display: flex; flex-direction: column; flex: 1; align-items: center; justify-content: center;">
							<div>12</div>
							<div></div>
						</div>
					</td>
					<td>
						<div style="display: flex; flex-direction: column; flex: 1; align-items: center; justify-content: center;">
							<div>13</div>
							<div style="border-top: 1px solid black;">50mm</div>
						</div>
					</td>
					<td>1</td>
					<td>1</td>
					<td>1</td>
					<td>1</td>
					<td>4</td>
					<td>93.3%</td>
					<td class="scale">
						<div style="display: flex; flex-direction: column; align-items: flex-start;">
							<div style="width: 7px; height: 6px; border-bottom: 1px solid #000;"></div>
							<div style="width: 7px; height: 6px; border-bottom: 1px solid #000;"></div>
							<div style="width: 7px; height: 6px; border-bottom: 1px solid #000;"></div>
							<div style="width: 7px; height: 6px; border-bottom: 1px solid #000;"></div>
							<div style="width: 7px; height: 6px; border-bottom: 1px solid #000;"></div>
							<div style="width: 7px; height: 6px; border-bottom: 1px solid #000;"></div>
							<div style="width: 7px; height: 6px; border-bottom: 1px solid #000;"></div>
							<div style="width: 7px; height: 6px; border-bottom: 1px solid #000;"></div>
							<div style="width: 7px; height: 6px; border-bottom: 1px solid #000;"></div>
							<div style="width: 21px; height: 6px; text-align: right; line-height: 0.7em;">7</div>
						</div>
					</td>
				</tr>
				<tr style="height: 60px;">
					<td colspan="1" style="vertical-align: bottom;">
						<div style="display: flex; flex-direction: row;">
							<div style="display: flex; flex: 1%; flex-direction: column; align-items: center; justify-content: flex-end;">
								<div>2025<br>08/26<br>17:00</div>
							</div>
						</div>
					</td>
					<td>
						<div>P1</div>
						<div>D1</div>
					</td>
					<td>
						1.500<br>to<br>1.950
					</td>
					<td></td>
					<td class="description-cell">
						Loose, light grey SAND
					</td>
					<td></td>
					<td>
						<div style="display: flex; flex-direction: column; flex: 1; align-items: center; justify-content: center;">
							<div>12</div>
							<div></div>
						</div>
					</td>
					<td>
						<div style="display: flex; flex-direction: column; flex: 1; align-items: center; justify-content: center;">
							<div>13</div>
							<div style="border-top: 1px solid black;">50mm</div>
						</div>
					</td>
					<td>1</td>
					<td>1</td>
					<td>1</td>
					<td>1</td>
					<td>4</td>
					<td>93.3%</td>
					<td class="scale">
						<div style="display: flex; flex-direction: column; align-items: flex-start;">
							<div style="width: 7px; height: 6px; border-bottom: 1px solid #000;"></div>
							<div style="width: 7px; height: 6px; border-bottom: 1px solid #000;"></div>
							<div style="width: 7px; height: 6px; border-bottom: 1px solid #000;"></div>
							<div style="width: 7px; height: 6px; border-bottom: 1px solid #000;"></div>
							<div style="width: 7px; height: 6px; border-bottom: 1px solid #000;"></div>
							<div style="width: 7px; height: 6px; border-bottom: 1px solid #000;"></div>
							<div style="width: 7px; height: 6px; border-bottom: 1px solid #000;"></div>
							<div style="width: 7px; height: 6px; border-bottom: 1px solid #000;"></div>
							<div style="width: 7px; height: 6px; border-bottom: 1px solid #000;"></div>
							<div style="width: 21px; height: 6px; text-align: right; line-height: 0.7em;">8</div>
						</div>
					</td>
				</tr>
				<tr style="height: 60px;">
					<td colspan="1" style="vertical-align: bottom;">
						<div style="display: flex; flex-direction: row;">
							<div style="display: flex; flex: 1%; flex-direction: column; align-items: center; justify-content: flex-end;">
								<div>2025<br>08/26<br>17:00</div>
							</div>
						</div>
					</td>
					<td>
						<div>P1</div>
						<div>D1</div>
					</td>
					<td>
						1.500<br>to<br>1.950
					</td>
					<td></td>
					<td class="description-cell">
						Loose, light grey SAND
					</td>
					<td></td>
					<td>
						<div style="display: flex; flex-direction: column; flex: 1; align-items: center; justify-content: center;">
							<div>12</div>
							<div></div>
						</div>
					</td>
					<td>
						<div style="display: flex; flex-direction: column; flex: 1; align-items: center; justify-content: center;">
							<div>13</div>
							<div style="border-top: 1px solid black;">50mm</div>
						</div>
					</td>
					<td>1</td>
					<td>1</td>
					<td>1</td>
					<td>1</td>
					<td>4</td>
					<td>93.3%</td>
					<td class="scale">
						<div style="display: flex; flex-direction: column; align-items: flex-start;">
							<div style="width: 7px; height: 6px; border-bottom: 1px solid #000;"></div>
							<div style="width: 7px; height: 6px; border-bottom: 1px solid #000;"></div>
							<div style="width: 7px; height: 6px; border-bottom: 1px solid #000;"></div>
							<div style="width: 7px; height: 6px; border-bottom: 1px solid #000;"></div>
							<div style="width: 7px; height: 6px; border-bottom: 1px solid #000;"></div>
							<div style="width: 7px; height: 6px; border-bottom: 1px solid #000;"></div>
							<div style="width: 7px; height: 6px; border-bottom: 1px solid #000;"></div>
							<div style="width: 7px; height: 6px; border-bottom: 1px solid #000;"></div>
							<div style="width: 7px; height: 6px; border-bottom: 1px solid #000;"></div>
							<div style="width: 21px; height: 6px; text-align: right; line-height: 0.7em;">9</div>
						</div>
					</td>
				</tr>
				
			</table>
		</div>
		<div class="footer-info">
			<div style="display: flex; flex: 1; flex-direction: column;">
				<div style="display: flex; align-items: center; justify-content: center; height: 2em; border-bottom: 1px solid #000;">NOTES: </div>
				<div style="display: flex; flex-direction: row; padding: 5px;">
					<div style="text-align: right;">
						<div style="white-space: pre;">P </div>
						<div style="white-space: pre;">UD </div>
						<div style="white-space: pre;">PS </div>
						<div style="white-space: pre;">MZ </div>
						<div style="white-space: pre;">D </div>
						<div style="white-space: pre;">VS </div>
						<div style="white-space: pre;">W </div>
						<div style="white-space: pre;">C </div>
					</div>
					<div>
						<div>= Standard Penetration Test (SPT)</div>
						<div>= 50 mm dia. undisturbed sample</div>
						<div>= Piston Sample</div>
						<div>= Mazier Sample</div>
						<div>= Disturbed Sample</div>
						<div>= Vane Shear Test</div>
						<div>= Water Sample</div>
						<div>= Core Sample (Rock)</div>
					</div>
				</div>
			</div>
			<div style="display: flex; flex: 0.8; flex-direction: column; border-left: 1px solid #000">
				<div style="display: flex; align-items: center; justify-content: center; height: 2em; border-bottom: 1px solid #000;">Cohesive Soil (N)</div>
				<div style="display: flex; flex-direction: row; padding: 5px;">
					<div style="text-align: right;">
						<div style="white-space: pre;"> 0</div>
						<div style="white-space: pre;"> 2</div>
						<div style="white-space: pre;"> 4</div>
						<div style="white-space: pre;"> 8</div>
						<div style="white-space: pre;">15</div>
					</div>
					<div style="text-align: center;">
						<div style="white-space: pre;"> - </div>
						<div style="white-space: pre;"> - </div>
						<div style="white-space: pre;"> - </div>
						<div style="white-space: pre;"> - </div>
						<div style="white-space: pre;"> - </div>
						<div style="white-space: pre;"> > </div>
					</div>
					<div>
						<div style="white-space: pre;">2</div>
						<div style="white-space: pre;">4</div>
						<div style="white-space: pre;">8</div>
						<div style="white-space: pre;">15</div>
						<div style="white-space: pre;">30</div>
						<div style="white-space: pre;">30</div>
					</div>
					<div>
						<div style="white-space: pre;">   Very Soft</div>
						<div style="white-space: pre;">   Soft</div>
						<div style="white-space: pre;">   Firm</div>
						<div style="white-space: pre;">   Stiff</div>
						<div style="white-space: pre;">   Very Stiff</div>
						<div style="white-space: pre;">   Hard</div>
					</div>
				</div>
			</div>
			<div style="display: flex; flex: 0.8; flex-direction: column; border-left: 1px solid #000">
				<div style="display: flex; align-items: center; justify-content: center; height: 2em; border-bottom: 1px solid #000;">Non Cohesive Soil (N)</div>
				<div style="display: flex; flex-direction: row; padding: 5px;">
					<div style="text-align: right;">
						<div style="white-space: pre;"> 0</div>
						<div style="white-space: pre;"> 4</div>
						<div style="white-space: pre;">10</div>
						<div style="white-space: pre;">30</div>
					</div>
					<div style="text-align: center;">
						<div style="white-space: pre;"> - </div>
						<div style="white-space: pre;"> - </div>
						<div style="white-space: pre;"> - </div>
						<div style="white-space: pre;"> - </div>
						<div style="white-space: pre;"> > </div>
					</div>
					<div>
						<div style="white-space: pre;">4</div>
						<div style="white-space: pre;">10</div>
						<div style="white-space: pre;">30</div>
						<div style="white-space: pre;">50</div>
						<div style="white-space: pre;">50</div>
					</div>
					<div>
						<div style="white-space: pre;">   Very Loose</div>
						<div style="white-space: pre;">   Loose</div>
						<div style="white-space: pre;">   Medium Dense</div>
						<div style="white-space: pre;">   Dense</div>
						<div style="white-space: pre;">   Very Dense</div>
					</div>
				</div>
			</div>
			<div style="display: flex; flex: 1; flex-direction: column; border-left: 1px solid #000; padding: 5px;">
				<div style="display: flex; flex-direction: column; flex: 1;">Contractor: </div>
				<div style="display: flex; flex-direction: column; flex: 1;">Date Started: </div>
				<div style="display: flex; flex-direction: column; flex: 1;">Date Finished: </div>
			</div>
			<div style="display: flex; flex: 1; flex-direction: column; border-left: 1px solid #000; padding: 5px;">
				<div style="display: flex; flex-direction: column; flex: 1;">Logged by: </div>
				<div style="display: flex; flex-direction: column; flex: 1;">Checked by: </div>
				<div style="display: flex; flex-direction: column; flex: 1;">Date: </div>
			</div>
		</div>
	</div>
</body>
</html>
		`
	);
}
*/