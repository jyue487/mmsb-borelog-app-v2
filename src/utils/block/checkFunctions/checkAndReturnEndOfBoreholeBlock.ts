import { createDefaultDayWorkStatus } from "@/src/constants/DayWorkStatus";
import { END_OF_BOREHOLE_OTHER_INSTALLATIONS_CUSTOM, END_OF_BOREHOLE_OTHER_INSTALLATIONS_NONE, endOfBoreholeOtherInstallationsType } from "@/src/constants/endOfBorehole";
import { BaseBlock, Block, END_OF_BOREHOLE_BLOCK_TYPE_ID } from "@/src/interfaces/Block";
import { EndOfBoreholeBlock } from "@/src/interfaces/EndOfBoreholeBlock";
import { throwError } from "@/src/utils/error/throwError";
import { stringIsNonNegativeFloat, stringToDecimalPoint } from "@/src/utils/numbers";
import { parseWaterLevelInMetresStr } from "@/src/utils/waterLevel";
import { randomUUID } from "expo-crypto";

type Params = {
  blocks: Block[];
  boreholeId: string;
  otherInstallations: endOfBoreholeOtherInstallationsType;
  customInstallations: string;
  installationDepthInMetresStr: string;
  installationDate: Date | null,
  installationTime: Date | null,
  waterLevelInMetresStr: string,
  remarks: string;
};

export function checkAndReturnEndOfBoreholeBlock({
  blocks,
  boreholeId,
  otherInstallations,
  customInstallations,
  installationDepthInMetresStr,
  installationDate,
  installationTime,
  waterLevelInMetresStr,
  remarks,
}: Params): BaseBlock & EndOfBoreholeBlock {

  if (blocks.length === 0 || blocks.length === 1 && blocks[0].blockTypeId === END_OF_BOREHOLE_BLOCK_TYPE_ID) {
    throwError("Error: Borelog is empty");
  }

  const blockBeforeEndOfBoreholeBlock: Block = (blocks[blocks.length - 1].blockTypeId === END_OF_BOREHOLE_BLOCK_TYPE_ID) ? blocks[blocks.length - 2] : blocks[blocks.length - 1];
  const endOfBoreholeDepthInMetres: number = blockBeforeEndOfBoreholeBlock.baseDepthInMetres;

  let installationDepthInMetres: number | null = null;
  let description: string = `End of BH at ${endOfBoreholeDepthInMetres.toFixed(3)}m`;
  if (otherInstallations !== END_OF_BOREHOLE_OTHER_INSTALLATIONS_NONE) {
    if (installationDate === null || installationTime === null) {
      throwError('Installation Date and Time should not be empty');
    }
    if (!stringIsNonNegativeFloat(installationDepthInMetresStr)) {
      throwError('Installation Depth');
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

  const waterLevelInMetres = parseWaterLevelInMetresStr(waterLevelInMetresStr);

  const newBlock: Block = {
    id: randomUUID(),
    boreholeId: boreholeId,
    blockTypeId: END_OF_BOREHOLE_BLOCK_TYPE_ID,
    dayWorkStatus: createDefaultDayWorkStatus(),
    topDepthInMetres: endOfBoreholeDepthInMetres,
    baseDepthInMetres: endOfBoreholeDepthInMetres,
    description: description,
    otherInstallations: otherInstallations,
    customInstallations: customInstallations,
    installationDepthInMetres: installationDepthInMetres,
    installationDate: installationDate,
    installationTime: installationTime,
    waterLevelInMetres: waterLevelInMetres,
    remarks: remarks.trim(),
    createdAt: new Date(),
    updatedAt: null,
  };
  return newBlock;
}