import { EndOfBoreholeInputQuestions } from "@/components/inputQuestions/EndOfBoreholeInputQuestions";
import { styles } from "@/constants/styles";
import { BaseBlock, Block } from "@/interfaces/Block";
import { EndOfBoreholeBlock } from "@/interfaces/EndOfBoreholeBlock";
import { checkAndReturnEndOfBoreholeBlock } from "@/utils/checkFunctions/checkAndReturnEndOfBoreholeBlock";
import { useState } from "react";
import { Button, ViewProps } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export type EditEndOfBoreholeBlockDetailsInputFormProps = ViewProps & {
  blocks: Block[];
  setBlocks: React.Dispatch<React.SetStateAction<Block[]>>;
  oldBlock: BaseBlock & EndOfBoreholeBlock;
  setIsEditState: React.Dispatch<React.SetStateAction<boolean>>;
};

export function EditEndOfBoreholeBlockDetailsInputForm({
  blocks,
  setBlocks,
  oldBlock,
  setIsEditState,
}: EditEndOfBoreholeBlockDetailsInputFormProps) {

  const [otherInstallations, setOtherInstallations] = useState<string>(oldBlock.otherInstallations);
  const [customInstallations, setCustomInstallations] = useState<string>(oldBlock.customInstallations);
  const [installationDepthInMetresStr, setInstallationDepthInMetresStr] = useState<string>(oldBlock.installationDepthInMetres?.toFixed(3) ?? '');
  const [remarks, setRemarks] = useState<string>(oldBlock.remarks);

  return (
    <GestureHandlerRootView style={styles.blockDetailsInputForm}>
      <EndOfBoreholeInputQuestions 
        blocks={blocks}
        otherInstallations={otherInstallations} setOtherInstallations={setOtherInstallations}
        customInstallations={customInstallations} setCustomInstallations={setCustomInstallations}
        installationDepthInMetresStr={installationDepthInMetresStr} setInstallationDepthInMetresStr={setInstallationDepthInMetresStr}
        remarks={remarks} setRemarks={setRemarks}
      />
      <Button
        title='Confirm'
        onPress={() => {
          const newBlock: Block = checkAndReturnEndOfBoreholeBlock({
            blocks: blocks,
            boreholeId: oldBlock.boreholeId,
            otherInstallations: otherInstallations,
            customInstallations: customInstallations,
            installationDepthInMetresStr: installationDepthInMetresStr,
            remarks: remarks,
          });
          setBlocks((blocks: Block[]) => blocks.map((b: Block) => (b === oldBlock) ? {...newBlock, id: b.id, blockId: b.blockId} : b));
          setIsEditState(false);
        }}
      />
    </GestureHandlerRootView>
  );
}