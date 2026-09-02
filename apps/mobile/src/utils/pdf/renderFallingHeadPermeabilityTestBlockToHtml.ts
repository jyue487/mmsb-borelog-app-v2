import {
    BaseBlock,
    FALLING_HEAD_PERMEABILITY_TEST_SYMBOL,
    FallingHeadPermeabilityTestBlock,
} from '@mmsb/core';
import { renderDayWorkStatusToHtml } from "@/src/utils/pdf/renderDayWorkStatusToHtml";
import { renderDepthInfoToHtml } from "@/src/utils/pdf/renderDepthInfoToHtml";
import { renderScaleTicksToHtml } from "@/src/utils/pdf/renderScaleTicksToHtml";
import { renderDescriptionToHtml } from "./renderDescriptionToHtml";
import { renderWaterLevelToHtml } from "./renderWaterLevelToHtml";

export function renderFallingHeadPermeabilityTestBlockToHtml(block: BaseBlock & FallingHeadPermeabilityTestBlock, numberOfTicksToRender: number, scaleTickIndexWrapper: number[]) {
    return (
        `
        <tr>
            ${renderDayWorkStatusToHtml(block.dayWorkStatus)}
            <td>
                <div>${FALLING_HEAD_PERMEABILITY_TEST_SYMBOL}${block.permeabilityTestIndex}</div>
            </td>
            <td>${renderDepthInfoToHtml(block)}</td>
            ${renderWaterLevelToHtml(block.dayWorkStatus)}
            ${renderDescriptionToHtml(numberOfTicksToRender, `<i>${block.description}</i>`)}
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