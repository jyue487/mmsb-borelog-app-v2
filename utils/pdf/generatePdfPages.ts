import { TEXT_SIZE_SMALLER_ANDROID, TEXT_SIZE_UNIT } from "@/constants/textSize";
import { ASPHALT_BLOCK_TYPE_ID, Block, CAVITY_BLOCK_TYPE_ID, CONCRETE_SLAB_BLOCK_TYPE_ID, CONSTANT_HEAD_PERMEABILITY_TEST_BLOCK_TYPE_ID, CORING_BLOCK_TYPE_ID, CUSTOM_BLOCK_TYPE_ID, END_OF_BOREHOLE_BLOCK_TYPE_ID, FALLING_HEAD_PERMEABILITY_TEST_BLOCK_TYPE_ID, HA_BLOCK_TYPE_ID, LUGEON_TEST_BLOCK_TYPE_ID, MZ_BLOCK_TYPE_ID, PRESSUREMETER_TEST_BLOCK_TYPE_ID, PS_BLOCK_TYPE_ID, RISING_HEAD_PERMEABILITY_TEST_BLOCK_TYPE_ID, SPT_BLOCK_TYPE_ID, UD_BLOCK_TYPE_ID, VANE_SHEAR_TEST_BLOCK_TYPE_ID, WASH_BORING_BLOCK_TYPE_ID } from "@/interfaces/Block";
import { Borehole } from "@/interfaces/Borehole";
import { Project } from "@/interfaces/Project";
import { renderSptBlockToHtml } from "@/utils/pdf/renderSptBlockToHtml";
import { renderAsphaltBlockToHtml } from "./renderAsphaltBlockToHtml";
import { renderCavityBlockToHtml } from "./renderCavityBlockToHtml";
import { renderConcreteSlabBlockToHtml } from "./renderConcreteSlabBlockToHtml";
import { renderConstantHeadPermeabilityTestBlockToHtml } from "./renderConstantHeadPermeabilityTestBlockToHtml";
import { renderCoringBlockToHtml } from "./renderCoringBlockToHtml";
import { renderCustomBlockToHtml } from "./renderCustomBlockToHtml";
import { renderEmptyBlockToHtml } from "./renderEmptyBlockToHtml";
import { renderEndOfBoreholeBlockToHtml } from "./renderEndOfBoreholeBlockToHtml";
import { renderFallingHeadPermeabilityTestBlockToHtml } from "./renderFallingHeadPermeabilityTestBlockToHtml";
import { renderFooterToHtml } from "./renderFooterToHtml";
import { renderHaBlockToHtml } from "./renderHaBlockToHtml";
import { renderHeaderToHtml } from "./renderHeaderToHtml";
import { renderLugeonTestBlockToHtml } from "./renderLugeonTestBlockToHtml";
import { renderMzBlockToHtml } from "./renderMzBlockToHtml";
import { renderPressuremeterTestBlockToHtml } from "./renderPressuremeterTestBlockToHtml";
import { renderPsBlockToHtml } from "./renderPsBlockToHtml";
import { renderRisingHeadPermeabilityTestBlockToHtml } from "./renderRisingHeadPermeabilityTestBlockToHtml";
import { renderUdBlockToHtml } from "./renderUdBlockToHtml";
import { renderVaneShearTestBlockToHtml } from "./renderVaneShearTestBlockToHtml";
import { renderWashBoringBlockToHtml } from "./renderWashBoringBlockToHtml";

export function generatePdfPages(project: Project, borehole: Borehole, blocks: Block[], scaleTickIndexWrapper: number[], mmsbLogoBase64: string): string {
    let pageIndex: number = 1;
    let blockIndex : number = 0;

    const checkAndReturnSptSpecialCaseResult = (block: Block, nextBlock: Block | null, nextNextBlock: Block | null): string | null => {
        if (
            (
                block.blockTypeId === SPT_BLOCK_TYPE_ID
            )
            && (
                nextBlock !== null
            )
            && (
                nextBlock.topDepthInMetres < block.baseDepthInMetres
            )
            && (
                nextBlock.blockTypeId === FALLING_HEAD_PERMEABILITY_TEST_BLOCK_TYPE_ID
                || nextBlock.blockTypeId === RISING_HEAD_PERMEABILITY_TEST_BLOCK_TYPE_ID
                || nextBlock.blockTypeId === CONSTANT_HEAD_PERMEABILITY_TEST_BLOCK_TYPE_ID
            )
        ) {
            const blockHeightInTicks: number = (!nextNextBlock) ? Math.max(10, Math.round(block.baseDepthInMetres * 10) - scaleTickIndexWrapper[0]) : Math.round(nextNextBlock.topDepthInMetres * 10) - scaleTickIndexWrapper[0];
            const numberOfTicksToRender: number = Math.min(blockHeightInTicks, pageIndex * 90 - scaleTickIndexWrapper[0]);
            return renderSptBlockToHtml(block, numberOfTicksToRender, scaleTickIndexWrapper, nextBlock);
        }
        return null;
    };
    const checkAndReturnUdSpecialCaseResult = (block: Block, nextBlock: Block | null, nextNextBlock: Block | null): string | null => {
        if (
            (
                block.blockTypeId === UD_BLOCK_TYPE_ID
            )
            && (
                nextBlock !== null
            )
            && (
                nextBlock.topDepthInMetres < block.baseDepthInMetres
            )
            && (
                nextBlock.blockTypeId === FALLING_HEAD_PERMEABILITY_TEST_BLOCK_TYPE_ID
                || nextBlock.blockTypeId === RISING_HEAD_PERMEABILITY_TEST_BLOCK_TYPE_ID
                || nextBlock.blockTypeId === CONSTANT_HEAD_PERMEABILITY_TEST_BLOCK_TYPE_ID
            )
        ) {
            const blockHeightInTicks: number = (!nextNextBlock) ? Math.max(10, Math.round(block.baseDepthInMetres * 10) - scaleTickIndexWrapper[0]) : Math.round(nextNextBlock.topDepthInMetres * 10) - scaleTickIndexWrapper[0];
            const numberOfTicksToRender: number = Math.min(blockHeightInTicks, pageIndex * 90 - scaleTickIndexWrapper[0]);
            return renderUdBlockToHtml(block, numberOfTicksToRender, scaleTickIndexWrapper, nextBlock);
        }
        return null;
    };
    const checkAndReturnCoringSpecialCaseResult = (block: Block, nextBlock: Block | null, nextNextBlock: Block | null): string | null => {
        if (
            (
                block.blockTypeId === CORING_BLOCK_TYPE_ID
            )
            && (
                nextBlock !== null
            )
            && (
                nextBlock.topDepthInMetres < block.baseDepthInMetres
            )
            && (
                nextBlock.blockTypeId === LUGEON_TEST_BLOCK_TYPE_ID
            )
        ) {
            const blockHeightInTicks: number = (!nextNextBlock) ? Math.max(10, Math.round(block.baseDepthInMetres * 10) - scaleTickIndexWrapper[0]) : Math.round(nextNextBlock.topDepthInMetres * 10) - scaleTickIndexWrapper[0];
            const numberOfTicksToRender: number = Math.min(blockHeightInTicks, pageIndex * 90 - scaleTickIndexWrapper[0]);
            return renderCoringBlockToHtml(block, numberOfTicksToRender, scaleTickIndexWrapper, nextBlock);
        }
        return null;
    };

    const renderBlocksToHtml = () => {
        console.log('calling renderBlocksToHtml');
        let result: string = ``;

        // Check if need to pad with empty block
        if (Math.round(blocks[blockIndex].topDepthInMetres * 10) - scaleTickIndexWrapper[0] > 0) {
            const numberOfTicksToRender: number = Math.round(blocks[blockIndex].topDepthInMetres * 10) - scaleTickIndexWrapper[0];
            result += renderEmptyBlockToHtml(numberOfTicksToRender, scaleTickIndexWrapper, blocks[(blockIndex > 0) ? blockIndex - 1 : blockIndex].blockTypeId);
        }
        while (blockIndex < blocks.length) {
            if (scaleTickIndexWrapper[0] === pageIndex * 90) {
                break;
            }
            const i: number = blockIndex;
            const block: Block = blocks[i];
            const nextBlock: Block | null = (i + 1 < blocks.length) ? blocks[i + 1] : null;
            const nextNextBlock: Block | null = (i + 2 < blocks.length) ? blocks[i + 2] : null;

            const sptSpecialCaseResult: string | null = checkAndReturnSptSpecialCaseResult(block, nextBlock, nextNextBlock);
            if (sptSpecialCaseResult !== null) {
                result += sptSpecialCaseResult;
                blockIndex += 2;
                continue;
            }
            const udSpecialCaseResult: string | null = checkAndReturnUdSpecialCaseResult(block, nextBlock, nextNextBlock);
            if (udSpecialCaseResult !== null) {
                result += udSpecialCaseResult;
                blockIndex += 2;
                continue;
            }
            const coringSpecialCaseResult: string | null = checkAndReturnCoringSpecialCaseResult(block, nextBlock, nextNextBlock);
            if (coringSpecialCaseResult !== null) {
                result += coringSpecialCaseResult;
                blockIndex += 2;
                continue;
            }


            const blockHeightInTicks: number = (!nextBlock) ? Math.max(10, Math.round(block.baseDepthInMetres * 10) - scaleTickIndexWrapper[0]) : Math.round(nextBlock.topDepthInMetres * 10) - scaleTickIndexWrapper[0];
            const numberOfTicksToRender: number = Math.min(blockHeightInTicks, pageIndex * 90 - scaleTickIndexWrapper[0]);

            // If remaining space too small (less than half of actual block height), then pad with empty block
            if (numberOfTicksToRender < blockHeightInTicks / 2) {
                result += renderEmptyBlockToHtml(numberOfTicksToRender, scaleTickIndexWrapper, blocks[(blockIndex > 0) ? blockIndex - 1 : blockIndex].blockTypeId);
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
            case ASPHALT_BLOCK_TYPE_ID:
                result += renderAsphaltBlockToHtml(block, numberOfTicksToRender, scaleTickIndexWrapper);
                break;
            case END_OF_BOREHOLE_BLOCK_TYPE_ID:
                result += renderEndOfBoreholeBlockToHtml(block, pageIndex * 90 - scaleTickIndexWrapper[0], scaleTickIndexWrapper);
                break;
            case CUSTOM_BLOCK_TYPE_ID:
                result += renderCustomBlockToHtml(block, numberOfTicksToRender, scaleTickIndexWrapper);
                break;
            case VANE_SHEAR_TEST_BLOCK_TYPE_ID:
                result += renderVaneShearTestBlockToHtml(block, numberOfTicksToRender, scaleTickIndexWrapper);
                break;
            case FALLING_HEAD_PERMEABILITY_TEST_BLOCK_TYPE_ID:
                result += renderFallingHeadPermeabilityTestBlockToHtml(block, numberOfTicksToRender, scaleTickIndexWrapper);
                break;
            case RISING_HEAD_PERMEABILITY_TEST_BLOCK_TYPE_ID:
                result += renderRisingHeadPermeabilityTestBlockToHtml(block, numberOfTicksToRender, scaleTickIndexWrapper);
                break;
            case CONSTANT_HEAD_PERMEABILITY_TEST_BLOCK_TYPE_ID:
                result += renderConstantHeadPermeabilityTestBlockToHtml(block, numberOfTicksToRender, scaleTickIndexWrapper);
                break;
            case LUGEON_TEST_BLOCK_TYPE_ID:
                result += renderLugeonTestBlockToHtml(block, numberOfTicksToRender, scaleTickIndexWrapper);
                break;
            case PRESSUREMETER_TEST_BLOCK_TYPE_ID:
                result += renderPressuremeterTestBlockToHtml(block, numberOfTicksToRender, scaleTickIndexWrapper);
                break;
            default:
                break;

            }
            // console.log(result);
            ++blockIndex;
        }
        if (blockIndex === blocks.length) {
            const numberOfTicksToRender: number = pageIndex * 90 - scaleTickIndexWrapper[0];
            result += renderEmptyBlockToHtml(numberOfTicksToRender, scaleTickIndexWrapper, (blocks.length > 0) ? blocks[blocks.length - 1].blockTypeId : SPT_BLOCK_TYPE_ID);
        }
        return result;
    };

    let pages: ((pageNumber: number, totalNumberOfPages: number) => string)[] = [];
    while (blockIndex < blocks.length) {
        const blocksInHtml: string = renderBlocksToHtml();
        const page = (pageNumber: number, totalNumberOfPages: number) => (
            `
            <div class="page">
                ${renderHeaderToHtml(project, borehole, mmsbLogoBase64, pageNumber, totalNumberOfPages)}
                <div>
                    <table>
                        <tr>
                            <th rowspan="4" style="width: 5.8%;">DATE<br>&<br>TIME</th>
                            <th rowspan="4" style="width: 6.5%; font-size: ${TEXT_SIZE_SMALLER_ANDROID}${TEXT_SIZE_UNIT};">SAMPLING<br><br>TESTING<br><br>CORING</th>
                            <th rowspan="3" style="width: 12%;">DEPTH</th>
                            <th rowspan="3" style="width: 5%;">WL</th>
                            <th rowspan="4">DESCRIPTION</th>
                            <th colspan="6" style="width: 28%;">SPT</th>
                            <th rowspan="4" style="width: 5.5%;">SPT<br>(N)</th>
                            <th rowspan="3" style="width: 4.2%;">R/r</th>
                            <th rowspan="3" style="width: 3.5%; writing-mode: vertical-lr; transform: rotate(180deg); white-space: nowrap;">SCALE</th>
                        </tr>
                        <tr>
                            <th style="font-size: ${TEXT_SIZE_SMALLER_ANDROID}${TEXT_SIZE_UNIT};">75mm</th>
                            <th style="font-size: ${TEXT_SIZE_SMALLER_ANDROID}${TEXT_SIZE_UNIT};">75mm</th>
                            <th style="font-size: ${TEXT_SIZE_SMALLER_ANDROID}${TEXT_SIZE_UNIT};">75mm</th>
                            <th style="font-size: ${TEXT_SIZE_SMALLER_ANDROID}${TEXT_SIZE_UNIT};">75mm</th>
                            <th style="font-size: ${TEXT_SIZE_SMALLER_ANDROID}${TEXT_SIZE_UNIT};">75mm</th>
                            <th style="font-size: ${TEXT_SIZE_SMALLER_ANDROID}${TEXT_SIZE_UNIT};">75mm</th>
                        </tr>
                        <tr>
                            <th colspan="2" style="height: 40px;">CORE<br/>RUN</th>
                            <th colspan="2" style="height: 40px;">T.C.R.</th>
                            <th colspan="2" style="height: 40px;">R.Q.D.</th>
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
                        
                        ${blocksInHtml}
                    </table>
                </div>
                ${renderFooterToHtml()}
            </div>
            `
        );
        pages.push(page);
        scaleTickIndexWrapper[0] = pageIndex * 90;
        ++pageIndex;
    }

    const totalNumberOfPages: number = pages.length;
    let result: string = ``;
    for (let i = 0; i < pages.length; ++i) {
        const pageNumber: number = i + 1;
        const page = pages[i];
        result += page(pageNumber, totalNumberOfPages);
    }

    return result;
}


