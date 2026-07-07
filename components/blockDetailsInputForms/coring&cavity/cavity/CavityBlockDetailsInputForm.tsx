import React, { useState } from "react";
import { Button, View, type ViewProps } from "react-native";

import { CavityBlockInputQuestions } from "@/components/inputQuestions/CavityBlockInputQuestions";
import { DayWorkStatus } from "@/constants/DayWorkStatus";
import { styles } from "@/constants/styles";
import { BaseBlock, Block, CAVITY_BLOCK_TYPE_ID } from "@/interfaces/Block";
import { CavityBlock, createDefaultCavityBlock } from "@/interfaces/CavityBlock";
import { editBlockAsync } from "@/utils/block/editBlockFunctions/editBlockAsync";
import { checkAndReturnCavityBlock } from "@/utils/block/checkFunctions/checkAndReturnCavityBlock";
import { isNonNegative, roundToDecimalPoint } from "@/utils/numbers";
import { SpecificBlockDetailsInputFormProps } from "../../BlockDetailsInputForm";
import { depthInMetresToString } from "@/utils/depth";

export function CavityBlockDetailsInputForm({ boreholeId, inputBlock, onSubmitAsync, ...otherProps }: SpecificBlockDetailsInputFormProps) {
  const block: BaseBlock & CavityBlock = (inputBlock !== null && inputBlock.blockTypeId === CAVITY_BLOCK_TYPE_ID) ? inputBlock : createDefaultCavityBlock();
  const [dayWorkStatus, setDayWorkStatus] = useState<DayWorkStatus>(block.dayWorkStatus);
  const [topDepthInMetresStr, setTopDepthInMetresStr] = useState<string>(depthInMetresToString(block.topDepthInMetres));
  const [baseDepthInMetresStr, setBaseDepthInMetresStr] = useState<string>(depthInMetresToString(block.baseDepthInMetres));
  const [description, setDescription] = useState<string>(block.description);

  return (
    <>
      <CavityBlockInputQuestions
        dayWorkStatus={dayWorkStatus} setDayWorkStatus={setDayWorkStatus}
        topDepthInMetresStr={topDepthInMetresStr} setTopDepthInMetresStr={setTopDepthInMetresStr}
        baseDepthInMetresStr={baseDepthInMetresStr} setBaseDepthInMetresStr={setBaseDepthInMetresStr}
        description={description} setDescription={setDescription}
      />
      <Button
        title='Confirm'
        color={styles.confirmButton.color}
        onPress={async () => {
          const newBlock: Block = checkAndReturnCavityBlock({
            boreholeId: boreholeId,
            dayWorkStatus: dayWorkStatus,
            topDepthInMetresStr: topDepthInMetresStr,
            baseDepthInMetresStr: baseDepthInMetresStr,
            description: description,
          });
          await onSubmitAsync(newBlock);
        }}
      />
    </>
  );
}
