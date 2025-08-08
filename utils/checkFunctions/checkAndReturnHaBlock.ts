import { DayWorkStatus } from "@/constants/DayWorkStatus";
import { BaseBlock, Block, HA_BLOCK_TYPE_ID } from "@/interfaces/Block";
import { ColourProperties } from "@/interfaces/ColourProperties";
import { HaBlock } from "@/interfaces/HaBlock";
import { SoilProperties } from "@/interfaces/SoilProperties";
import { throwError } from "../error/throwError";
import { checkAndReturnDayWorkStatus } from "./checkAndReturnDayWorkStatus";
import { checkAndReturnHaBlockDescription } from "./checkAndReturnHaBlockDescription";

type Params = {
    blocks: Block[];
    boreholeId: number;
    dayWorkStatus: DayWorkStatus;
    topDepthInMetresStr: string;
    baseDepthInMetresStr: string;
    requireSample: boolean;
    colourProperties: ColourProperties;
    soilProperties: SoilProperties;
};

export function checkAndReturnHaBlock({
    blocks,
    boreholeId,
    dayWorkStatus,
    topDepthInMetresStr,
    baseDepthInMetresStr,
    requireSample,
    colourProperties,
    soilProperties,
}: Params): BaseBlock & HaBlock {

    dayWorkStatus = checkAndReturnDayWorkStatus(dayWorkStatus);
    
    if (isNaN(parseFloat(topDepthInMetresStr)) || parseFloat(topDepthInMetresStr) < 0) {
        throwError('Error: Top Depth');
    }
    if (isNaN(parseFloat(baseDepthInMetresStr)) || parseFloat(baseDepthInMetresStr) < parseFloat(topDepthInMetresStr)) {
        throwError('Error: Base Depth');
    }

    const description: string = checkAndReturnHaBlockDescription(requireSample, colourProperties, soilProperties);
    const topDepthInMetres: number = parseFloat(parseFloat(topDepthInMetresStr).toFixed(3));
    const baseDepthInMetres: number = parseFloat(parseFloat(baseDepthInMetresStr).toFixed(3));

    const haSampleIndex: number = blocks.filter((block: Block) => block.blockTypeId === HA_BLOCK_TYPE_ID).length + 1;

    const newBlock: Block = {
        id: blocks.length + 1,
        blockTypeId: HA_BLOCK_TYPE_ID,
        boreholeId: boreholeId, 
        haSampleIndex: haSampleIndex,
        dayWorkStatus: dayWorkStatus,
        topDepthInMetres: topDepthInMetres,
        baseDepthInMetres: baseDepthInMetres,
        description: description,
        requireSample: requireSample,
        colourProperties: colourProperties,
        soilProperties: soilProperties,
        createdAt: new Date(),
        updatedAt: null,
    };

    return newBlock;
}