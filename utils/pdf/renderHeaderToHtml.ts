export function renderHeaderToHtml(mmsbLogoBase64: string) {
    return (
        `
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
        `
    );
}