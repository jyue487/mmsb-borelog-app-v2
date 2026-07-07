import { EndOfBoreholeInputQuestions } from "@/components/inputQuestions/EndOfBoreholeInputQuestions";
import { styles } from "@/constants/styles";
import { BaseBlock, Block, END_OF_BOREHOLE_BLOCK_TYPE_ID } from "@/interfaces/Block";
import { createDefaultEndOfBoreholeBlock, EndOfBoreholeBlock } from "@/interfaces/EndOfBoreholeBlock";
import { editBlockAsync } from "@/utils/block/editBlockFunctions/editBlockAsync";
import { checkAndReturnEndOfBoreholeBlock } from "@/utils/block/checkFunctions/checkAndReturnEndOfBoreholeBlock";
import { useState } from "react";
import { Button, View, ViewProps } from "react-native";
import { SpecificBlockDetailsInputFormProps } from "@/components/blockDetailsInputForms/BlockDetailsInputForm";
import { endOfBoreholeOtherInstallationsType } from "@/constants/endOfBorehole";

export function EndOfBoreholeBlockDetailsInputForm({ boreholeId, inputBlock, onSubmitAsync, blocks, ...otherProps }: SpecificBlockDetailsInputFormProps & { blocks: Block[] }) {
  const block: BaseBlock & EndOfBoreholeBlock = (inputBlock !== null && inputBlock.blockTypeId === END_OF_BOREHOLE_BLOCK_TYPE_ID) ? inputBlock : createDefaultEndOfBoreholeBlock();
  const [otherInstallations, setOtherInstallations] = useState<endOfBoreholeOtherInstallationsType>(block.otherInstallations);
  const [customInstallations, setCustomInstallations] = useState<string>(block.customInstallations);
  const [installationDepthInMetresStr, setInstallationDepthInMetresStr] = useState<string>(block.installationDepthInMetres?.toFixed(3) ?? '');
  const [remarks, setRemarks] = useState<string>(block.remarks);

  return (
    <>
      <EndOfBoreholeInputQuestions 
        blocks={blocks}
        otherInstallations={otherInstallations} setOtherInstallations={setOtherInstallations}
        customInstallations={customInstallations} setCustomInstallations={setCustomInstallations}
        installationDepthInMetresStr={installationDepthInMetresStr} setInstallationDepthInMetresStr={setInstallationDepthInMetresStr}
        remarks={remarks} setRemarks={setRemarks}
      />
      <Button
        title='Confirm'
        color={styles.confirmButton.color}
        onPress={async () => {
          const newBlock: Block = checkAndReturnEndOfBoreholeBlock({
            blocks: blocks,
            boreholeId: boreholeId,
            otherInstallations: otherInstallations,
            customInstallations: customInstallations,
            installationDepthInMetresStr: installationDepthInMetresStr,
            remarks: remarks,
          });
          await onSubmitAsync(newBlock);
        }}
      />
    </>
  );
}