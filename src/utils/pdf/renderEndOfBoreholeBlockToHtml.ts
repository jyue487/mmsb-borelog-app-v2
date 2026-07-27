import { END_OF_BOREHOLE_OTHER_INSTALLATIONS_NONE } from "@/src/constants/endOfBorehole";
import { WaterLevelInMetres } from "@/src/constants/waterLevel";
import { BaseBlock } from "@/src/interfaces/Block";
import { EndOfBoreholeBlock } from "@/src/interfaces/EndOfBoreholeBlock";
import { renderScaleTicksToHtml } from "@/src/utils/pdf/renderScaleTicksToHtml";
import { getDate, getTime } from "../datetime";
import { throwError } from "../error/throwError";
import { renderDescriptionToHtml } from "./renderDescriptionToHtml";

function renderEndOfBoreholeWaterLevelToHtml(wl: WaterLevelInMetres): string {
  return `<td>${(wl === null) ? '' : (typeof wl === 'string') ? wl : wl.toFixed(2)}</td>`;
}

function renderEndOfBoreholeInstallationDateTimeToHtml(block: BaseBlock & EndOfBoreholeBlock): string {
  if (block.otherInstallations === END_OF_BOREHOLE_OTHER_INSTALLATIONS_NONE) {
    return '<td></td>';
  }
  if (block.installationDate === null || block.installationTime === null) {
    throwError('Installation Date and Time is Required');
  }
  return (
    `
    <td class="datetime" style="vertical-align: top;">
      <div style="display: flex; flex: 1; flex-direction: column; align-items: center;">
          <div style="transform: scale(0.67); line-height: 0.7;">${getDate(block.installationDate)}</div>
          <div style="transform: scale(0.67); line-height: 0.7;">${getTime(block.installationTime)}</div>
      </div>
    </td>
    `
  );
}

export function renderEndOfBoreholeBlockToHtml(block: BaseBlock & EndOfBoreholeBlock, numberOfTicksToRender: number, scaleTickIndexWrapper: number[]) {
  return (
    `
    <tr>
      ${renderEndOfBoreholeInstallationDateTimeToHtml(block)}
      <td></td>
      <td></td>
      ${renderEndOfBoreholeWaterLevelToHtml(block.waterLevelInMetres)}
      ${renderDescriptionToHtml(numberOfTicksToRender, block.description + ((block.remarks.length === 0) ? '' : `<br><br>Remarks: ${block.remarks}.`))}
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      ${renderScaleTicksToHtml(numberOfTicksToRender, scaleTickIndexWrapper)}
    </tr>
    `
  )
}