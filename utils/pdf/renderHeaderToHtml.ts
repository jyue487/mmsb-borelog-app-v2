import { Borehole } from "@/interfaces/Borehole";
import { Project } from "@/interfaces/Project";

export function renderHeaderToHtml(project: Project, borehole: Borehole, mmsbLogoBase64: string) {
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
						<div style="font-weight: bold;">${project.title}</div>
					</div>
					<div style="display: flex; flex-direction: row;">
						<div style="white-space: pre;">LOCATION: </div>
						<div style="font-weight: bold;">${project.location}</div>
					</div>
					<div style="display: flex; flex-direction: row;">
						<div style="white-space: pre;">CLIENT: </div>
						<div style="font-weight: bold;">${project.client}</div>
					</div>
					<div style="display: flex; flex-direction: row;">
						<div style="white-space: pre;">CONSULTANT: </div>
						<div style="font-weight: bold;">${project.consultant}</div>
					</div>
					<div style="display: flex; flex-direction: row; white-space: pre; align-items: baseline;">BOREHOLE NO:   <div class="header-borehole-name">${borehole.name}</div></div>
				</div>
			</div>
			<div class="header-right">
				<div style="white-space: pre;">       SHEET         of</div>
				<br>
				<div class="header-right-form">
					<div style="display: flex; flex-direction: row;">
						<div style="white-space: pre;">TYPE OF BORING: </div>
						<div style="font-weight: bold;">${borehole.typeOfBoring}</div>
					</div>
					<div style="display: flex; flex-direction: row;">
						<div style="white-space: pre;">TYPE OF RIG: </div>
						<div style="font-weight: bold;">${borehole.typeOfRig}</div>
					</div>
					<div style="display: flex; flex-direction: row;">
						<div style="white-space: pre;">DIA. OF BORING: </div>
						<div style="font-weight: bold;">${borehole.diameterOfBoring}</div>
					</div>
					<div style="display: flex; flex-direction: row;">
						<div style="white-space: pre;">GROUND LEVEL: </div>
						<div style="font-weight: bold;">${(borehole.reducedLevelInMetres === null) ? '' : borehole.reducedLevelInMetres.toFixed(3)}m (RL)</div>
					</div>
					<div style="display: flex; flex-direction: row;">
						<div style="white-space: pre;">COORDINATE: </div>
						<div style="font-weight: bold;">${(borehole.eastingInMetres === null || borehole.northingInMetres === null) ? '' : `(${borehole.eastingInMetres.toFixed(3)}E, ${borehole.northingInMetres.toFixed(3)}N)`}</div>
					</div>
				</div>
			</div>
		</div>
        `
    );
}