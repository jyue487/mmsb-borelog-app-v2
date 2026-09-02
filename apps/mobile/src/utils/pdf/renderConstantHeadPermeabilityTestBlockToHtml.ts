import {
    BaseBlock,
    CONSTANT_HEAD_PERMEABILITY_TEST_SYMBOL,
    ConstantHeadPermeabilityTestBlock,
} from '@mmsb/core';
import { renderDayWorkStatusToHtml } from "@/src/utils/pdf/renderDayWorkStatusToHtml";
import { renderDepthInfoToHtml } from "@/src/utils/pdf/renderDepthInfoToHtml";
import { renderScaleTicksToHtml } from "@/src/utils/pdf/renderScaleTicksToHtml";
import { renderDescriptionToHtml } from "./renderDescriptionToHtml";
import { renderWaterLevelToHtml } from "./renderWaterLevelToHtml";

export function renderConstantHeadPermeabilityTestBlockToHtml(block: BaseBlock & ConstantHeadPermeabilityTestBlock, numberOfTicksToRender: number, scaleTickIndexWrapper: number[]) {
    return (
        `
        <tr>
            ${renderDayWorkStatusToHtml(block.dayWorkStatus)}
            <td>
                <div>${CONSTANT_HEAD_PERMEABILITY_TEST_SYMBOL}${block.permeabilityTestIndex}</div>
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