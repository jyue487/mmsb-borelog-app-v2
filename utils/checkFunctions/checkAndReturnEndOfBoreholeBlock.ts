import { DAY_CONTINUE_WORK_TYPE } from "@/constants/DayWorkStatus";
import { END_OF_BOREHOLE_OTHER_INSTALLATIONS_CUSTOM, END_OF_BOREHOLE_OTHER_INSTALLATIONS_NONE } from "@/constants/endOfBorehole";
import { BaseBlock, Block, END_OF_BOREHOLE_BLOCK_TYPE_ID } from "@/interfaces/Block";
import { EndOfBoreholeBlock } from "@/interfaces/EndOfBoreholeBlock";
import { throwError } from "../error/throwError";
import { stringIsNonNegativeFloat, stringToDecimalPoint } from "../numbers";

type Params = {
    blocks: Block[];
    boreholeId: number;
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

    if (blocks.length === 0) {
        throwError("Error: Borelog is empty");
    }
    
    const endOfBoreholeDepthInMetres: number = blocks[blocks.length - 1].baseDepthInMetres;

    let installationDepthInMetres: number | null = null;
    let description: string = `End of BH at ${endOfBoreholeDepthInMetres}m`;
    if (otherInstallations !== END_OF_BOREHOLE_OTHER_INSTALLATIONS_NONE) {
        if (!stringIsNonNegativeFloat(installationDepthInMetresStr)) {
            throwError('Error: Installation Depth');
        }
        installationDepthInMetres = stringToDecimalPoint(installationDepthInMetresStr, 3);
        if (installationDepthInMetres > endOfBoreholeDepthInMetres) {
            throwError('Error: Installation Depth cannot be greater than the borehole depth');
        }
        if (otherInstallations === END_OF_BOREHOLE_OTHER_INSTALLATIONS_CUSTOM) {
            description += ` with installation of ${customInstallations.trim()}`;
        } else {
            description += ` with installation of ${otherInstallations}`;
        }
        description += ` to ${installationDepthInMetres}m`;

        if (remarks.trim().length > 0) {
            description += `. Remarks: ${remarks.trim()}`;
        }
    }
    const newBlock: Block = {
        id: blocks.length + 1,
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
        remarks: remarks,
        createdAt: new Date(),
        updatedAt: null,
    };
    return newBlock;
}