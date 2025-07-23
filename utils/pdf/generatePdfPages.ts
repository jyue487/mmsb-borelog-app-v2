import { Block } from "@/interfaces/Block";
import { renderSptBlockToHtml } from "@/utils/pdf/renderSptBlockToHtml";
import { renderEmptyBlockToHtml } from "./renderEmptyBlockToHtml";
import { renderFooterToHtml } from "./renderFooterToHtml";
import { renderHeaderToHtml } from "./renderHeaderToHtml";

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
            const nextBlock: Block | undefined = (i + 1 < blocks.length) ? blocks[i + 1] : undefined;

            const blockHeightInTicks: number = (!nextBlock) ? 10 : Math.round(nextBlock.topDepthInMetres * 10) - scaleTickIndexWrapper[0];
            const numberOfTicksToRender: number = Math.min(blockHeightInTicks, pageIndex * 90 - scaleTickIndexWrapper[0]);

            // If remaining space too small (less than half of actual block height), then pad with empty block
            if (numberOfTicksToRender < blockHeightInTicks / 2) {
                result += renderEmptyBlockToHtml(numberOfTicksToRender, scaleTickIndexWrapper);
                continue;
            }
            
            switch (block.blockType) {
            case 'Spt':
                result += renderSptBlockToHtml(block, numberOfTicksToRender, scaleTickIndexWrapper);
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
                            <th colspan="2" style="height: 40px;">CORE<br/>RUN</th>
                            <th colspan="2" style="height: 40px;">R.Q.D.</th>
                            <th colspan="2" style="height: 40px;">C.R.</th>
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

