import { BaseBlock } from "@/interfaces/Block";
import { ConcreteSlabBlock } from "@/interfaces/ConcreteSlabBlock";
import { renderDayWorkStatusToHtml } from "@/utils/pdf/renderDayWorkStatusToHtml";
import { renderDepthInfoToHtml } from "@/utils/pdf/renderDepthInfoToHtml";
import { renderScaleTicksToHtml } from "@/utils/pdf/renderScaleTicksToHtml";
import { renderWaterLevelToHtml } from "./renderWaterLevelToHtml";
import { renderDescriptionToHtml } from "./renderDescriptionToHtml";

export function renderConcreteSlabBlockToHtml(block: BaseBlock & ConcreteSlabBlock, numberOfTicksToRender: number,scaleTickIndexWrapper: number[]) {
    return (
        `
        <tr>
            ${renderDayWorkStatusToHtml(block.dayWorkStatus)}
            <td></td>
            ${renderDepthInfoToHtml(block)}
            ${renderWaterLevelToHtml(block.dayWorkStatus)}
            ${renderDescriptionToHtml(block.description)}
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