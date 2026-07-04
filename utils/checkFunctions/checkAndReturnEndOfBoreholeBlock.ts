import { DAY_CONTINUE_WORK_TYPE } from "@/constants/DayWorkStatus";
import { END_OF_BOREHOLE_OTHER_INSTALLATIONS_CUSTOM, END_OF_BOREHOLE_OTHER_INSTALLATIONS_NONE } from "@/constants/endOfBorehole";
import { BaseBlock, Block, END_OF_BOREHOLE_BLOCK_TYPE_ID } from "@/interfaces/Block";
import { EndOfBoreholeBlock } from "@/interfaces/EndOfBoreholeBlock";
import { throwError } from "../error/throwError";
import { stringIsNonNegativeFloat, stringToDecimalPoint } from "../numbers";
import { randomUUID } from "expo-crypto";

type Params = {
    blocks: Block[];
    boreholeId: string;
    otherInstallations: string;
    customInstallations: string;
    installationDepthInMetresStr: string;
    remarks: string;
};

export function checkAndReturnEndOfBoreholeBlock ({
    blocks,
    boreholeId,
    otherInstallations,
    customInstallations,
    installationDepthInMetresStr,
    remarks,
}: Params): BaseBlock & EndOfBoreholeBlock {

    if (blocks.length === 0 || blocks.length === 1 && blocks[0].blockTypeId === END_OF_BOREHOLE_BLOCK_TYPE_ID) {
        throwError("Error: Borelog is empty");
    }
    
    const blockBeforeEndOfBoreholeBlock: Block = (blocks[blocks.length - 1].blockTypeId === END_OF_BOREHOLE_BLOCK_TYPE_ID) ? blocks[blocks.length - 2]: blocks[blocks.length - 1];
    const endOfBoreholeDepthInMetres: number = blockBeforeEndOfBoreholeBlock.baseDepthInMetres;

    let installationDepthInMetres: number | null = null;
    let description: string = `End of BH at ${endOfBoreholeDepthInMetres.toFixed(3)}m`;
    if (otherInstallations !== END_OF_BOREHOLE_OTHER_INSTALLATIONS_NONE) {
        if (!stringIsNonNegativeFloat(installationDepthInMetresStr)) {
            throwError('Error: Installation Depth');
        }
        installationDepthInMetres = stringToDecimalPoint(installationDepthInMetresStr, 3);
        if (installationDepthInMetres > endOfBoreholeDepthInMetres) {
            installationDepthInMetres = endOfBoreholeDepthInMetres;
        }
        if (otherInstallations === END_OF_BOREHOLE_OTHER_INSTALLATIONS_CUSTOM) {
            description += ` with installation of ${customInstallations.trim()}`;
        } else {
            description += ` with installation of ${otherInstallations}`;
        }
        description += ` to ${installationDepthInMetres.toFixed(3)}m`;
    }
    description += '.';

    const newBlock: Block = {
        id: randomUUID(),
        boreholeId: boreholeId,
        blockTypeId: END_OF_BOREHOLE_BLOCK_TYPE_ID,
        dayWorkStatus: {
            dayWorkStatusType: DAY_CONTINUE_WORK_TYPE,
            date: new Date(),
            time: new Date(),
            waterLevelInMetres: null,
            casingDepthInMetres: null,
        },
        topDepthInMetres: endOfBoreholeDepthInMetres,
        baseDepthInMetres: endOfBoreholeDepthInMetres,
        description: description,
        otherInstallations: otherInstallations,
        customInstallations: customInstallations,
        installationDepthInMetres: installationDepthInMetres,
        remarks: remarks.trim(),
        createdAt: new Date(),
        updatedAt: null,
    };
    return newBlock;
}