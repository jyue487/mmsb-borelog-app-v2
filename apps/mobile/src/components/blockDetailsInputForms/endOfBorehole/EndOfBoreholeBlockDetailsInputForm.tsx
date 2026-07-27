import { SpecificBlockDetailsInputFormProps } from "@/src/components/blockDetailsInputForms/BlockDetailsInputForm";
import { EndOfBoreholeInputQuestions } from "@/src/components/inputQuestions/EndOfBoreholeInputQuestions";
import { endOfBoreholeOtherInstallationsType } from "@/src/constants/endOfBorehole";
import { BaseBlock, Block, END_OF_BOREHOLE_BLOCK_TYPE_ID } from "@/src/interfaces/Block";
import { createDefaultEndOfBoreholeBlock, EndOfBoreholeBlock } from "@/src/interfaces/EndOfBoreholeBlock";
import { checkAndReturnEndOfBoreholeBlock } from "@/src/utils/block/checkFunctions/checkAndReturnEndOfBoreholeBlock";
import { waterLevelInMetresToString } from "@/src/utils/waterLevel";
import { useEffect, useState } from "react";

export function EndOfBoreholeBlockDetailsInputForm({ boreholeId, inputBlock, setCheckAndReturnBlock, blocks, ...otherProps }: SpecificBlockDetailsInputFormProps & { blocks: Block[] }) {
  const block: BaseBlock & EndOfBoreholeBlock = (inputBlock !== null && inputBlock.blockTypeId === END_OF_BOREHOLE_BLOCK_TYPE_ID) ? inputBlock : createDefaultEndOfBoreholeBlock();
  const [otherInstallations, setOtherInstallations] = useState<endOfBoreholeOtherInstallationsType>(block.otherInstallations);
  const [customInstallations, setCustomInstallations] = useState<string>(block.customInstallations);
  const [installationDepthInMetresStr, setInstallationDepthInMetresStr] = useState<string>(block.installationDepthInMetres?.toFixed(3) ?? '');
  const [installationDate, setInstallationDate] = useState<Date | null>(block.installationDate);
  const [installationTime, setInstallationTime] = useState<Date | null>(block.installationTime);
  const [waterLevelInMetresStr, setWaterLevelInMetresStr] = useState<string>(waterLevelInMetresToString(block.waterLevelInMetres));
  const [remarks, setRemarks] = useState<string>(block.remarks);

  useEffect(() => {
    setCheckAndReturnBlock(() => () => {
      return checkAndReturnEndOfBoreholeBlock({
        blocks: blocks,
        boreholeId: boreholeId,
        otherInstallations: otherInstallations,
        customInstallations: customInstallations,
        installationDepthInMetresStr: installationDepthInMetresStr,
        installationDate: installationDate,
        installationTime: installationTime,
        waterLevelInMetresStr: waterLevelInMetresStr,
        remarks: remarks,
      });
    });
  }, [
    blocks,
    boreholeId,
    otherInstallations,
    customInstallations,
    installationDepthInMetresStr,
    installationDate,
    installationTime,
    waterLevelInMetresStr,
    remarks,
  ]);

  return (
    <>
      <EndOfBoreholeInputQuestions
        blocks={blocks}
        otherInstallations={otherInstallations} setOtherInstallations={setOtherInstallations}
        customInstallations={customInstallations} setCustomInstallations={setCustomInstallations}
        installationDepthInMetresStr={installationDepthInMetresStr} setInstallationDepthInMetresStr={setInstallationDepthInMetresStr}
        installationDate={installationDate} setInstallationDate={setInstallationDate}
        installationTime={installationTime} setInstallationTime={setInstallationTime}
        waterLevelInMetresStr={waterLevelInMetresStr} setWaterLevelInMetresStr={setWaterLevelInMetresStr}
        remarks={remarks} setRemarks={setRemarks}
      />
    </>
  );
}