import { Borehole } from "@/interfaces/Borehole";
import { Project } from "@/interfaces/Project";

export function renderHeaderToHtml(project: Project, borehole: Borehole, mmsbLogoBase64: string) {
    return (
        `
        <table 
			class="header-info" 
			style="
				border-collapse: collapse;
	  			table-layout: fixed;
				font-size: 7pt;
			">
			<tr>
				<td style="width: 55%">
					<div class="company-header" style="width: 100%; vertical-align: middle; text-align: center;">
						<div style="display: inline-block; vertical-align: bottom;"><img src="data:image/png;base64,${mmsbLogoBase64}" alt="" width="auto" height="30"></div>
						<div class="company-name" style="display: inline-block; font-size: 18pt; font-weight: bold; text-align: center; vertical-align: middle;">MAXI MEKAR SDN BHD</div>
					</div>
				</td>
				<td style="vertical-align: middle;">
					<div style="white-space: pre;">   SHEET         of</div>
				</td>
			</tr>
			<tr>
				<td class="header-left-form" style="padding: 9pt; text-align: left;">
					<table style="font-size: 7pt;">
						<tr>
							<td style="border: 0; text-align: left; vertical-align: top; width: 15%;">PROJECT: </td>
							<td style="border: 0; text-align: left; vertical-align: top; font-weight: bold; text-overflow: ellipsis;">${project.title}</td>
						</tr>
					</table>
					<div style="margin-top: 3pt;">
						<div style="white-space: pre; display: inline-block;">LOCATION: </div>
						<div style="font-weight: bold; display: inline-block;">${project.location}</div>
					</div>
					<div style="margin-top: 3pt;">
						<div style="white-space: pre; display: inline-block;">CLIENT: </div>
						<div style="font-weight: bold; display: inline-block;">${project.client}</div>
					</div>
					<div style="margin-top: 3pt;">
						<div style="white-space: pre; display: inline-block;">CONSULTANT: </div>
						<div style="font-weight: bold; display: inline-block;">${project.consultant}</div>
					</div>
					<div style="margin-top: 3pt;">
						<div style="white-space: pre; align-items: baseline; display: inline-block;">BOREHOLE NO:     </div>
						<div class="header-borehole-name" style="font-size: 13pt; font-weight: bold; display: inline-block;">${borehole.name}</div>
					</div>
				</td>
				<td class="header-right-form" style="padding: 9pt; text-align: left;">
					<div>
						<div style="white-space: pre; display: inline-block;">TYPE OF BORING: </div>
						<div style="font-weight: bold; display: inline-block;">${borehole.typeOfBoring}</div>
					</div>
					<div style="margin-top: 3pt;">
						<div style="white-space: pre; display: inline-block;">TYPE OF RIG: </div>
						<div style="font-weight: bold; display: inline-block;">${borehole.typeOfRig}</div>
					</div>
					<div style="margin-top: 3pt;">
						<div style="white-space: pre; display: inline-block;">DIA. OF BORING: </div>
						<div style="font-weight: bold; display: inline-block;">${borehole.diameterOfBoring}</div>
					</div>
					<div style="margin-top: 3pt;">
						<div style="white-space: pre; display: inline-block;">GROUND LEVEL: </div>
						<div style="font-weight: bold; display: inline-block;">${(borehole.reducedLevelInMetres === null) ? '' : borehole.reducedLevelInMetres.toFixed(3) + 'm (RL)'}</div>
					</div>
					<div style="margin-top: 3pt;">
						<div style="white-space: pre; display: inline-block;">COORDINATE: </div>
						<div style="font-weight: bold; display: inline-block;">${(borehole.eastingInMetres === null || borehole.northingInMetres === null) ? '' : `(${borehole.eastingInMetres.toFixed(3)}E, ${borehole.northingInMetres.toFixed(3)}N)`}</div>
					</div>
				</td>
			</tr>
		</table>
        `
    );
}
// export function renderHeaderToHtml(project: Project, borehole: Borehole, mmsbLogoBase64: string) {
//     return (
//         `
//         <div 
// 			class="header-info" 
// 			style="
// 				border-top: 0.5pt solid #000; 
// 				border-left: 0.5pt solid #000; 
// 				border-right: 0.5pt solid #000; 
// 				vertical-align: top; 
// 				font-size: 8pt;
// 			">
// 			<div class="header-left" style="display: inline-block; width: 55%;">
// 				<div class="company-header" style="border-bottom: 0.5pt solid #000; width: 100%; vertical-align: middle; text-align: center;">
// 					<div style="display: inline-block; vertical-align: bottom;"><img src="data:image/png;base64,${mmsbLogoBase64}" alt="" width="auto" height="30"></div>
// 					<div class="company-name" style="display: inline-block; font-size: 18pt; font-weight: bold; text-align: center; vertical-align: middle;">MAXI MEKAR SDN BHD</div>
// 				</div>
// 				<div class="header-left-form" style="padding: 9pt;">
// 					<div style="margin-top: 3pt;">
// 						<div style="white-space: pre; display: inline-block;">PROJECT: </div>
// 						<div style="font-weight: bold; display: inline-block;">${project.title}</div>
// 					</div>
// 					<div style="margin-top: 3pt;">
// 						<div style="white-space: pre; display: inline-block;">LOCATION: </div>
// 						<div style="font-weight: bold; display: inline-block;">${project.location}</div>
// 					</div>
// 					<div style="margin-top: 3pt;">
// 						<div style="white-space: pre; display: inline-block;">CLIENT: </div>
// 						<div style="font-weight: bold; display: inline-block;">${project.client}</div>
// 					</div>
// 					<div style="margin-top: 3pt;">
// 						<div style="white-space: pre; display: inline-block;">CONSULTANT: </div>
// 						<div style="font-weight: bold; display: inline-block;">${project.consultant}</div>
// 					</div>
// 					<div style="margin-top: 3pt;">
// 						<div style="white-space: pre; align-items: baseline; display: inline-block;">BOREHOLE NO:     </div>
// 						<div class="header-borehole-name" style="font-size: 13pt; font-weight: bold; display: inline-block;">${borehole.name}</div>
// 					</div>
// 				</div>
// 			</div>
// 			<div class="header-right" style="display: inline-block; border-left: 0.5pt solid #000; padding: 10pt; vertical-align: top; height: 100%;">
// 				<div style="white-space: pre;">       SHEET         of</div>
// 				<br>
// 				<div class="header-right-form">
// 					<div>
// 						<div style="white-space: pre; display: inline-block;">TYPE OF BORING: </div>
// 						<div style="font-weight: bold; display: inline-block;">${borehole.typeOfBoring}</div>
// 					</div>
// 					<div style="margin-top: 3pt;">
// 						<div style="white-space: pre; display: inline-block;">TYPE OF RIG: </div>
// 						<div style="font-weight: bold; display: inline-block;">${borehole.typeOfRig}</div>
// 					</div>
// 					<div style="margin-top: 3pt;">
// 						<div style="white-space: pre; display: inline-block;">DIA. OF BORING: </div>
// 						<div style="font-weight: bold; display: inline-block;">${borehole.diameterOfBoring}</div>
// 					</div>
// 					<div style="margin-top: 3pt;">
// 						<div style="white-space: pre; display: inline-block;">GROUND LEVEL: </div>
// 						<div style="font-weight: bold; display: inline-block;">${(borehole.reducedLevelInMetres === null) ? '' : borehole.reducedLevelInMetres.toFixed(3) + 'm (RL)'}</div>
// 					</div>
// 					<div style="margin-top: 3pt;">
// 						<div style="white-space: pre; display: inline-block;">COORDINATE: </div>
// 						<div style="font-weight: bold; display: inline-block;">${(borehole.eastingInMetres === null || borehole.northingInMetres === null) ? '' : `(${borehole.eastingInMetres.toFixed(3)}E, ${borehole.northingInMetres.toFixed(3)}N)`}</div>
// 					</div>
// 				</div>
// 			</div>
// 		</div>
//         `
//     );
// }