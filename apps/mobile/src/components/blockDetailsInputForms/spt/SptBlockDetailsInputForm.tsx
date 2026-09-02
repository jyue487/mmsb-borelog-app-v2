import React, { useEffect, useState } from "react";

import { SpecificBlockDetailsInputFormProps } from "@/src/components/blockDetailsInputForms/BlockDetailsInputForm";
import { SptBlockInputQuestions } from "@/src/components/inputQuestions/SptBlockInputQuestions";
import {
  BaseBlock,
  ColourProperties,
  createDefaultSptBlock,
  DayWorkStatus,
  SoilProperties,
  SPT_BLOCK_TYPE_ID,
  SptBlock,
} from '@mmsb/core';
import { checkAndReturnSptBlock } from "@/src/utils/block/checkFunctions/checkAndReturnSptBlock";
import { depthInMetresToString } from "@/src/utils/depth";
import { isNonNegative } from "@/src/utils/numbers";

export function SptBlockDetailsInputForm({ boreholeId, inputBlock, setCheckAndReturnBlock, ...otherProps }: SpecificBlockDetailsInputFormProps) {
  const block: BaseBlock & SptBlock = (inputBlock !== null && inputBlock.blockTypeId === SPT_BLOCK_TYPE_ID) ? inputBlock : createDefaultSptBlock();
  const [dayWorkStatus, setDayWorkStatus] = useState<DayWorkStatus>(block.dayWorkStatus);
  const [topDepthInMetresStr, setTopDepthInMetresStr] = useState<string>(depthInMetresToString(block.topDepthInMetres));
  const [seatingIncBlows1Str, setSeatingIncBlows1Str] = useState<string>(isNonNegative(block.seatingIncBlows1) ? block.seatingIncBlows1.toString() : '');
  const [seatingIncBlows2Str, setSeatingIncBlows2Str] = useState<string>(block.seatingIncBlows2?.toString() ?? '');
  const [seatingIncPen1Str, setSeatingIncPen1Str] = useState<string>(isNonNegative(block.seatingIncPen1) ? block.seatingIncPen1.toString() : '');
  const [seatingIncPen2Str, setSeatingIncPen2Str] = useState<string>(block.seatingIncPen2?.toString() ?? '');
  const [mainIncBlows1Str, setMainIncBlows1Str] = useState<string>(isNonNegative(block.mainIncBlows1) ? block.mainIncBlows1.toString() : '');
  const [mainIncBlows2Str, setMainIncBlows2Str] = useState<string>(block.mainIncBlows2?.toString() ?? '');
  const [mainIncBlows3Str, setMainIncBlows3Str] = useState<string>(block.mainIncBlows3?.toString() ?? '');
  const [mainIncBlows4Str, setMainIncBlows4Str] = useState<string>(block.mainIncBlows4?.toString() ?? '');
  const [mainIncPen1Str, setMainIncPen1Str] = useState<string>(isNonNegative(block.mainIncBlows1) ? block.mainIncPen1.toString() : '');
  const [mainIncPen2Str, setMainIncPen2Str] = useState<string>(block.mainIncPen2?.toString() ?? '');
  const [mainIncPen3Str, setMainIncPen3Str] = useState<string>(block.mainIncPen3?.toString() ?? '');
  const [mainIncPen4Str, setMainIncPen4Str] = useState<string>(block.mainIncPen4?.toString() ?? '');
  const [isSeatingIncBlows1Active, setIsSeatingIncBlows1Active] = useState<boolean>(block.isSeatingIncBlows1Active);
  const [isSeatingIncBlows2Active, setIsSeatingIncBlows2Active] = useState<boolean>(block.isSeatingIncBlows2Active);
  const [isMainIncBlows1Active, setIsMainIncBlows1Active] = useState<boolean>(block.isMainIncBlows1Active);
  const [isMainIncBlows2Active, setIsMainIncBlows2Active] = useState<boolean>(block.isMainIncBlows2Active);
  const [isMainIncBlows3Active, setIsMainIncBlows3Active] = useState<boolean>(block.isMainIncBlows3Active);
  const [isMainIncBlows4Active, setIsMainIncBlows4Active] = useState<boolean>(block.isMainIncBlows4Active);
  const [isSeatingIncPen1Active, setIsSeatingIncPen1Active] = useState<boolean>(block.isSeatingIncPen1Active);
  const [isSeatingIncPen2Active, setIsSeatingIncPen2Active] = useState<boolean>(block.isSeatingIncPen2Active);
  const [isMainIncPen1Active, setIsMainIncPen1Active] = useState<boolean>(block.isMainIncPen1Active);
  const [isMainIncPen2Active, setIsMainIncPen2Active] = useState<boolean>(block.isMainIncPen2Active);
  const [isMainIncPen3Active, setIsMainIncPen3Active] = useState<boolean>(block.isMainIncPen3Active);
  const [isMainIncPen4Active, setIsMainIncPen4Active] = useState<boolean>(block.isMainIncPen4Active);
  const [recoveryLengthInMillimetresStr, setRecoveryLengthInMillimetresStr] = useState<string>(isNonNegative(block.recoveryLengthInMillimetres) ? block.recoveryLengthInMillimetres.toString() : '');
  const [colourProperties, setColourProperties] = useState<ColourProperties>(block.colourProperties);
  const [soilProperties, setSoilProperties] = useState<SoilProperties>(block.soilProperties);

  useEffect(() => {
    setCheckAndReturnBlock(() => () => {
      return checkAndReturnSptBlock({
        boreholeId: boreholeId,
        dayWorkStatus: dayWorkStatus,
        topDepthInMetresStr: topDepthInMetresStr,
        seatingIncBlows1Str: seatingIncBlows1Str,
        seatingIncBlows2Str: seatingIncBlows2Str,
        seatingIncPen1Str: seatingIncPen1Str,
        seatingIncPen2Str: seatingIncPen2Str,
        mainIncBlows1Str: mainIncBlows1Str,
        mainIncBlows2Str: mainIncBlows2Str,
        mainIncBlows3Str: mainIncBlows3Str,
        mainIncBlows4Str: mainIncBlows4Str,
        mainIncPen1Str: mainIncPen1Str,
        mainIncPen2Str: mainIncPen2Str,
        mainIncPen3Str: mainIncPen3Str,
        mainIncPen4Str: mainIncPen4Str,
        recoveryLengthInMillimetresStr: recoveryLengthInMillimetresStr,
        colourProperties: colourProperties,
        soilProperties: soilProperties,
        isSeatingIncBlows1Active: isSeatingIncBlows1Active,
        isSeatingIncBlows2Active: isSeatingIncBlows2Active,
        isMainIncBlows1Active: isMainIncBlows1Active,
        isMainIncBlows2Active: isMainIncBlows2Active,
        isMainIncBlows3Active: isMainIncBlows3Active,
        isMainIncBlows4Active: isMainIncBlows4Active,
        isSeatingIncPen1Active: isSeatingIncPen1Active,
        isSeatingIncPen2Active: isSeatingIncPen2Active,
        isMainIncPen1Active: isMainIncPen1Active,
        isMainIncPen2Active: isMainIncPen2Active,
        isMainIncPen3Active: isMainIncPen3Active,
        isMainIncPen4Active: isMainIncPen4Active,
      });
    });
  }, [
    boreholeId,
    dayWorkStatus,
    topDepthInMetresStr,
    seatingIncBlows1Str,
    seatingIncBlows2Str,
    seatingIncPen1Str,
    seatingIncPen2Str,
    mainIncBlows1Str,
    mainIncBlows2Str,
    mainIncBlows3Str,
    mainIncBlows4Str,
    mainIncPen1Str,
    mainIncPen2Str,
    mainIncPen3Str,
    mainIncPen4Str,
    recoveryLengthInMillimetresStr,
    colourProperties,
    soilProperties,
    isSeatingIncBlows1Active,
    isSeatingIncBlows2Active,
    isMainIncBlows1Active,
    isMainIncBlows2Active,
    isMainIncBlows3Active,
    isMainIncBlows4Active,
    isSeatingIncPen1Active,
    isSeatingIncPen2Active,
    isMainIncPen1Active,
    isMainIncPen2Active,
    isMainIncPen3Active,
    isMainIncPen4Active,
  ]);

  return (
    <>
      <SptBlockInputQuestions
        dayWorkStatus={dayWorkStatus} setDayWorkStatus={setDayWorkStatus}
        topDepthInMetresStr={topDepthInMetresStr} setTopDepthInMetresStr={setTopDepthInMetresStr}
        seatingIncBlows1Str={seatingIncBlows1Str} setSeatingIncBlows1Str={setSeatingIncBlows1Str}
        seatingIncBlows2Str={seatingIncBlows2Str} setSeatingIncBlows2Str={setSeatingIncBlows2Str}
        seatingIncPen1Str={seatingIncPen1Str} setSeatingIncPen1Str={setSeatingIncPen1Str}
        seatingIncPen2Str={seatingIncPen2Str} setSeatingIncPen2Str={setSeatingIncPen2Str}
        mainIncBlows1Str={mainIncBlows1Str} setMainIncBlows1Str={setMainIncBlows1Str}
        mainIncBlows2Str={mainIncBlows2Str} setMainIncBlows2Str={setMainIncBlows2Str}
        mainIncBlows3Str={mainIncBlows3Str} setMainIncBlows3Str={setMainIncBlows3Str}
        mainIncBlows4Str={mainIncBlows4Str} setMainIncBlows4Str={setMainIncBlows4Str}
        mainIncPen1Str={mainIncPen1Str} setMainIncPen1Str={setMainIncPen1Str}
        mainIncPen2Str={mainIncPen2Str} setMainIncPen2Str={setMainIncPen2Str}
        mainIncPen3Str={mainIncPen3Str} setMainIncPen3Str={setMainIncPen3Str}
        mainIncPen4Str={mainIncPen4Str} setMainIncPen4Str={setMainIncPen4Str}
        isSeatingIncBlows1Active={isSeatingIncBlows1Active} setIsSeatingIncBlows1Active={setIsSeatingIncBlows1Active}
        isSeatingIncBlows2Active={isSeatingIncBlows2Active} setIsSeatingIncBlows2Active={setIsSeatingIncBlows2Active}
        isMainIncBlows1Active={isMainIncBlows1Active} setIsMainIncBlows1Active={setIsMainIncBlows1Active}
        isMainIncBlows2Active={isMainIncBlows2Active} setIsMainIncBlows2Active={setIsMainIncBlows2Active}
        isMainIncBlows3Active={isMainIncBlows3Active} setIsMainIncBlows3Active={setIsMainIncBlows3Active}
        isMainIncBlows4Active={isMainIncBlows4Active} setIsMainIncBlows4Active={setIsMainIncBlows4Active}
        isSeatingIncPen1Active={isSeatingIncPen1Active} setIsSeatingIncPen1Active={setIsSeatingIncPen1Active}
        isSeatingIncPen2Active={isSeatingIncPen2Active} setIsSeatingIncPen2Active={setIsSeatingIncPen2Active}
        isMainIncPen1Active={isMainIncPen1Active} setIsMainIncPen1Active={setIsMainIncPen1Active}
        isMainIncPen2Active={isMainIncPen2Active} setIsMainIncPen2Active={setIsMainIncPen2Active}
        isMainIncPen3Active={isMainIncPen3Active} setIsMainIncPen3Active={setIsMainIncPen3Active}
        isMainIncPen4Active={isMainIncPen4Active} setIsMainIncPen4Active={setIsMainIncPen4Active}
        recoveryLengthInMillimetresStr={recoveryLengthInMillimetresStr} setRecoveryLengthInMillimetresStr={setRecoveryLengthInMillimetresStr}
        colourProperties={colourProperties} setColourProperties={setColourProperties}
        soilProperties={soilProperties} setSoilProperties={setSoilProperties}
      />
    </>
  );
}
