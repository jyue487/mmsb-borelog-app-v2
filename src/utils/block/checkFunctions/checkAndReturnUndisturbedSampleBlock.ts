
import { DayWorkStatus } from "@/src/constants/DayWorkStatus";
import { BaseBlock, MZ_BLOCK_TYPE_ID, PS_BLOCK_TYPE_ID, UD_BLOCK_TYPE_ID } from "@/src/interfaces/Block";
import { ColourProperties } from "@/src/interfaces/ColourProperties";
import { MzBlock } from "@/src/interfaces/MzBlock";
import { PsBlock } from "@/src/interfaces/PsBlock";
import { SoilProperties } from "@/src/interfaces/SoilProperties";
import { UdBlock } from "@/src/interfaces/UdBlock";
import { checkAndReturnDayWorkStatus } from "@/src/utils/block/checkFunctions/checkAndReturnDayWorkStatus";
import { checkAndReturnUndisturbedSampleDescription } from "@/src/utils/block/checkFunctions/checkAndReturnUndisturbedSampleDescription";
import { throwError } from "@/src/utils/error/throwError";
import { stringIsNonNegativeFloat, stringToDecimalPoint } from "@/src/utils/numbers";
import { randomUUID } from "expo-crypto";

type Params = {
  undisturbedSampleBlockTypeId: typeof UD_BLOCK_TYPE_ID | typeof MZ_BLOCK_TYPE_ID | typeof PS_BLOCK_TYPE_ID;
  boreholeId: string;
  dayWorkStatus: DayWorkStatus;
  topDepthInMetresStr: string;
  penetrationDepthInMetresStr: string;
  recoveryLengthInMetresStr: string;
  topColourProperties: ColourProperties;
  topSoilProperties: SoilProperties;
  baseDitto: boolean;
  bottomColourProperties: ColourProperties;
  bottomSoilProperties: SoilProperties;
};

export function checkAndReturnUndisturbedSampleBlock({
  undisturbedSampleBlockTypeId,
  boreholeId,
  dayWorkStatus,
  topDepthInMetresStr,
  penetrationDepthInMetresStr,
  recoveryLengthInMetresStr,
  topColourProperties,
  topSoilProperties,
  baseDitto,
  bottomColourProperties,
  bottomSoilProperties,
}: Params): BaseBlock & (UdBlock | MzBlock | PsBlock) {

  dayWorkStatus = checkAndReturnDayWorkStatus(dayWorkStatus);

  if (!stringIsNonNegativeFloat(topDepthInMetresStr)) {
    throwError('Error: Top Depth');
  }
  if (!stringIsNonNegativeFloat(penetrationDepthInMetresStr)) {
    throwError('Error: Penetration Depth');
  }
  if (!stringIsNonNegativeFloat(recoveryLengthInMetresStr)) {
    throwError('Error: Recovery Length');
  }

  const topDepthInMetres: number = stringToDecimalPoint(topDepthInMetresStr, 3);
  const topDepthInMillimetres: number = topDepthInMetres * 1000;
  const penetrationDepthInMetres: number = stringToDecimalPoint(penetrationDepthInMetresStr, 3);
  const penetrationDepthInMillimetres: number = penetrationDepthInMetres * 1000;
  const baseDepthInMetres: number = (topDepthInMillimetres + penetrationDepthInMillimetres) / 1000;
  const recoveryLengthInMetres: number = stringToDecimalPoint(recoveryLengthInMetresStr, 3);
  const recoveryInPercentage: number = parseFloat((recoveryLengthInMetres / penetrationDepthInMetres * 100).toFixed(1));

  const description: string = checkAndReturnUndisturbedSampleDescription({
    recoveryLengthInMetres: recoveryLengthInMetres,
    topColourProperties: topColourProperties,
    topSoilProperties: topSoilProperties,
    baseDitto: baseDitto,
    bottomColourProperties: bottomColourProperties,
    bottomSoilProperties: bottomSoilProperties,
  });

  const newBlock: BaseBlock & (UdBlock | MzBlock | PsBlock) = {
    id: randomUUID(),
    blockTypeId: undisturbedSampleBlockTypeId,
    boreholeId: boreholeId,
    sampleIndex: -1,
    dayWorkStatus: dayWorkStatus,
    topDepthInMetres: topDepthInMetres,
    baseDepthInMetres: baseDepthInMetres,
    soilDescription: description,
    recoveryInPercentage: recoveryInPercentage,
    penetrationDepthInMetres: penetrationDepthInMetres,
    topColourProperties: topColourProperties,
    topSoilProperties: topSoilProperties,
    baseDitto: baseDitto,
    bottomColourProperties: bottomColourProperties,
    bottomSoilProperties: bottomSoilProperties,
    recoveryLengthInMetres: recoveryLengthInMetres,
    createdAt: new Date(),
    updatedAt: null,
  };

  return newBlock;
}