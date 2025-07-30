import { DAY_CONTINUE_WORK_TYPE } from "@/constants/DayWorkStatus";
import { BaseBlock, Block, END_OF_BOREHOLE_BLOCK_TYPE_ID } from "@/interfaces/Block";
import { EndOfBoreholeBlock } from "@/interfaces/EndOfBoreholeBlock";
import { stringIsNonNegativeFloat, stringToDecimalPoint } from "../numbers";
import { throwError } from "../error/throwError";

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
    if (otherInstallations !== 'None') {
        if (!stringIsNonNegativeFloat(installationDepthInMetresStr)) {
            throwError('Error: Installation Depth');
        }
        installationDepthInMetres = stringToDecimalPoint(installationDepthInMetresStr, 3);
        if (installationDepthInMetres > endOfBoreholeDepthInMetres) {
            throwError('Error: Installation Depth cannot be greater than the borehole depth');
        }
        if (otherInstallations === 'Custom') {
            description += ` with installation of ${customInstallations.trim()}`;
        } else {
            description += ` with installation of ${otherInstallations}`;
        }
            description += ` to ${installationDepthInMetres}m`;

        if (remarks.trim().length > 0) {
            description += `. Remarks: ${remarks}`;
        }
    }
    const newBlock: Block = {
        id: blocks.length + 1,
        blockId: blocks.length + 1,
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
    };
    return newBlock;
}