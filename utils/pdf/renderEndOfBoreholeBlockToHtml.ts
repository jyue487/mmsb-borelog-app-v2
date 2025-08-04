import { BaseBlock } from "@/interfaces/Block";
import { EndOfBoreholeBlock } from "@/interfaces/EndOfBoreholeBlock";
import { renderScaleTicksToHtml } from "@/utils/pdf/renderScaleTicksToHtml";
import { renderDescriptionToHtml } from "./renderDescriptionToHtml";

export function renderEndOfBoreholeBlockToHtml(block: BaseBlock & EndOfBoreholeBlock, numberOfTicksToRender: number, scaleTickIndexWrapper: number[]) {
    return (
        `
        <tr>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            ${renderDescriptionToHtml(numberOfTicksToRender, block.description)}
            <td></td>
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