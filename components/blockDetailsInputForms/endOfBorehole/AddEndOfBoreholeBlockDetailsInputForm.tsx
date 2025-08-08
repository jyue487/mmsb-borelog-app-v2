import { EndOfBoreholeInputQuestions } from "@/components/inputQuestions/EndOfBoreholeInputQuestions";
import { Block } from "@/interfaces/Block";
import { addBlockAsync } from "@/utils/addBlockFunctions/addBlockAsync";
import { checkAndReturnEndOfBoreholeBlock } from "@/utils/checkFunctions/checkAndReturnEndOfBoreholeBlock";
import { useState } from "react";
import { Button, ViewProps } from "react-native";

export type AddEndOfBoreholeBlockDetailsInputFormProps = ViewProps & {
  boreholeId: number;
  blocks: Block[];
  setBlocks: React.Dispatch<React.SetStateAction<Block[]>>;
  setIsAddNewBlockButtonPressed: React.Dispatch<React.SetStateAction<boolean>>;
};

export function AddEndOfBoreholeBlockDetailsInputForm({
  blocks,
  setBlocks,
  boreholeId,
  setIsAddNewBlockButtonPressed,
}: AddEndOfBoreholeBlockDetailsInputFormProps) {

  const [otherInstallations, setOtherInstallations] = useState<string>('None');
  const [customInstallations, setCustomInstallations] = useState<string>('');
  const [installationDepthInMetresStr, setInstallationDepthInMetresStr] = useState<string>('');
  const [remarks, setRemarks] = useState<string>('');

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
      onPress={async () => {
        const newBlock: Block = checkAndReturnEndOfBoreholeBlock({
          blocks: blocks,
          boreholeId: boreholeId,
          otherInstallations: otherInstallations,
          customInstallations: customInstallations,
          installationDepthInMetresStr: installationDepthInMetresStr,
          remarks: remarks,
        });
        setBlocks(await addBlockAsync(blocks, newBlock));
        setIsAddNewBlockButtonPressed(false);
      }}
    />
    </>
  );
}