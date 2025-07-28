import { Block, CAVITY_BLOCK_TYPE_ID, CONCRETE_PREMIX_BLOCK_TYPE_ID, CONCRETE_SLAB_BLOCK_TYPE_ID, CORING_BLOCK_TYPE_ID, END_OF_BOREHOLE_BLOCK_TYPE_ID, HA_BLOCK_TYPE_ID, MZ_BLOCK_TYPE_ID, PS_BLOCK_TYPE_ID, SPT_BLOCK_TYPE_ID, UD_BLOCK_TYPE_ID, WASH_BORING_BLOCK_TYPE_ID } from "@/interfaces/Block";
import { renderSptBlockToHtml } from "@/utils/pdf/renderSptBlockToHtml";
import { renderCavityBlockToHtml } from "./renderCavityBlockToHtml";
import { renderConcretePremixBlockToHtml } from "./renderConcretePremixBlockToHtml";
import { renderConcreteSlabBlockToHtml } from "./renderConcreteSlabBlockToHtml";
import { renderCoringBlockToHtml } from "./renderCoringBlockToHtml";
import { renderEmptyBlockToHtml } from "./renderEmptyBlockToHtml";
import { renderEndOfBoreholeBlockToHtml } from "./renderEndOfBoreholeBlockToHtml";
import { renderFooterToHtml } from "./renderFooterToHtml";
import { renderHaBlockToHtml } from "./renderHaBlockToHtml";
import { renderHeaderToHtml } from "./renderHeaderToHtml";
import { renderMzBlockToHtml } from "./renderMzBlockToHtml";
import { renderPsBlockToHtml } from "./renderPsBlockToHtml";
import { renderUdBlockToHtml } from "./renderUdBlockToHtml";
import { renderWashBoringBlockToHtml } from "./renderWashBoringBlockToHtml";

export function generatePdfPages(blocks: Block[], scaleTickIndexWrapper: number[], mmsbLogoBase64: string) {
    let pageIndex: number = 1;
    let blockIndex : number = 0;

    const renderBlocksToHtml = () => {
        let result: string = ``;

        // Check if need to pad with empty block
        if (Math.round(blocks[blockIndex].topDepthInMetres * 10) - scaleTickIndexWrapper[0] > 0) {
            const numberOfTicksToRender: number = Math.round(blocks[blockIndex].topDepthInMetres * 10) - scaleTickIndexWrapper[0];
            result += renderEmptyBlockToHtml(numberOfTicksToRender, scaleTickIndexWrapper);
        }
        while (blockIndex < blocks.length) {
            if (scaleTickIndexWrapper[0] === pageIndex * 90) {
                break;
            }
            const i: number = blockIndex;
            const block: Block = blocks[i];
            const nextBlock: Block | null = (i + 1 < blocks.length) ? blocks[i + 1] : null;

            const blockHeightInTicks: number = (!nextBlock) ? Math.max(10, Math.round((block.baseDepthInMetres - block.topDepthInMetres) * 10)) : Math.round(nextBlock.topDepthInMetres * 10) - scaleTickIndexWrapper[0];
            const numberOfTicksToRender: number = Math.min(blockHeightInTicks, pageIndex * 90 - scaleTickIndexWrapper[0]);

            // If remaining space too small (less than half of actual block height), then pad with empty block
            if (numberOfTicksToRender < blockHeightInTicks / 2) {
                result += renderEmptyBlockToHtml(numberOfTicksToRender, scaleTickIndexWrapper);
                continue;
            }
            
            switch (block.blockTypeId) {
            case SPT_BLOCK_TYPE_ID:
                result += renderSptBlockToHtml(block, numberOfTicksToRender, scaleTickIndexWrapper);
                break;
            case CORING_BLOCK_TYPE_ID:
                result += renderCoringBlockToHtml(block, numberOfTicksToRender, scaleTickIndexWrapper);
                break;
            case CAVITY_BLOCK_TYPE_ID:
                result += renderCavityBlockToHtml(block, numberOfTicksToRender, scaleTickIndexWrapper);
                break;
            case UD_BLOCK_TYPE_ID:
                result += renderUdBlockToHtml(block, numberOfTicksToRender, scaleTickIndexWrapper);
                break;
            case MZ_BLOCK_TYPE_ID:
                result += renderMzBlockToHtml(block, numberOfTicksToRender, scaleTickIndexWrapper);
                break;
            case PS_BLOCK_TYPE_ID:
                result += renderPsBlockToHtml(block, numberOfTicksToRender, scaleTickIndexWrapper);
                break;
            case HA_BLOCK_TYPE_ID:
                result += renderHaBlockToHtml(block, numberOfTicksToRender, scaleTickIndexWrapper);
                break;
            case WASH_BORING_BLOCK_TYPE_ID:
                result += renderWashBoringBlockToHtml(block, numberOfTicksToRender, scaleTickIndexWrapper);
                break;
            case CONCRETE_SLAB_BLOCK_TYPE_ID:
                result += renderConcreteSlabBlockToHtml(block, numberOfTicksToRender, scaleTickIndexWrapper);
                break;
            case CONCRETE_PREMIX_BLOCK_TYPE_ID:
                result += renderConcretePremixBlockToHtml(block, numberOfTicksToRender, scaleTickIndexWrapper);
                break;
            case END_OF_BOREHOLE_BLOCK_TYPE_ID:
                result += renderEndOfBoreholeBlockToHtml(block, pageIndex * 90 - scaleTickIndexWrapper[0], scaleTickIndexWrapper);
                break;
            default:
                break;

            }
            
            ++blockIndex;
        }
        if (blockIndex === blocks.length) {
            const numberOfTicksToRender: number = pageIndex * 90 - scaleTickIndexWrapper[0];
            result += renderEmptyBlockToHtml(numberOfTicksToRender, scaleTickIndexWrapper);
        }
        return result;
    };

    let pages: string = ``;
    while (blockIndex < blocks.length) {
        const page: string = (
            `
            <div class="page">
                ${renderHeaderToHtml(mmsbLogoBase64)}
                <div>
                    <table>
                        <tr>
                            <th rowspan="4" style="width: 5%;">
                                <div style="display: flex; height: 100%; width: 100%; align-items: center; justify-content: center; writing-mode: vertical-lr; transform: rotate(180deg); white-space: nowrap;">DATE & TIME</div>
                            </th>
                            <th rowspan="4" style="width: 7%;">SAMPLING<br><br>TESTING<br><br>CORING</th>
                            <th rowspan="3" style="width: 12%;">
                                <div style="display: flex; height: 100%; width: 100%; align-items: center; justify-content: center; white-space: nowrap;">
                                    DEPTH
                                </div>
                            </th>
                            <th rowspan="3" style="width: 5%;">
                                <div style="display: flex; height: 100%; width: 100%; align-items: center; justify-content: center; white-space: nowrap;">
                                    WL
                                </div>
                            </th>
                            <th rowspan="4">DESCRIPTION</th>
                            <th rowspan="3" style="width: 4%;">
                                <div style="display: flex; height: 100%; width: 100%; align-items: center; justify-content: center; writing-mode: vertical-lr; transform: rotate(180deg); white-space: nowrap;">
                                    THICKNESS
                                </div>
                            </th>
                            <th colspan="6" style="width: 24%;">SPT</th>
                            <th rowspan="4" style="width: 5.5%;">SPT<br>(N)</th>
                            <th rowspan="3" style="width: 4%;">R/r</th>
                            <th rowspan="3" style="width: 3%;">
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
                            <th colspan="2" style="height: 40px;">CORE<br/>RUN</th>
                            <th colspan="2" style="height: 40px;">R.Q.D.</th>
                            <th colspan="2" style="height: 40px;">C.R.</th>
                        </tr>
                        <tr>
                            <th>m</th>
                            <th>m</th>
                            <th>m</th>
                            <th colspan="2">m</th>
                            <th colspan="2">%</th>
                            <th colspan="2">%</th>
                            <th>%</th>
                            <th>m</th>
                        </tr>
                        
                        ${renderBlocksToHtml()}
                    </table>
                </div>
                ${renderFooterToHtml()}
            </div>
            `
        );
        pages += page;
        scaleTickIndexWrapper[0] = pageIndex * 90;
        ++pageIndex;
    }

    return pages;
}


