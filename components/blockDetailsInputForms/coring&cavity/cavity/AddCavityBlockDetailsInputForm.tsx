import React, { useState } from "react";
import { Button, Keyboard, Text, TextInput, TouchableOpacity, View, type ViewProps } from "react-native";
import { FlatList } from "react-native-gesture-handler";

import { DayWorkStatusInputQuestions } from '@/components/inputQuestions/DayWorkStatusInputQuestions';
import { DAY_CONTINUE_WORK_TYPE, DayWorkStatus, DayWorkStatusType } from "@/constants/DayWorkStatus";
import { styles } from "@/constants/styles";
import { Block, CAVITY_BLOCK_TYPE_ID } from "@/interfaces/Block";
import { checkAndReturnDayWorkStatus } from "@/utils/checkFunctions/checkAndReturnDayWorkStatus";
import { CavityBlockInputQuestions } from "@/components/inputQuestions/CavityBlockInputQuestions";
import { checkAndReturnCavityBlock } from "@/utils/checkFunctions/checkAndReturnCavityBlock";
import { addBlockAsync } from "@/utils/addBlockFunctions/addBlockAsync";

export type AddCavityBlockDetailsInputFormProps = ViewProps & {
  blocks: Block[];
  setBlocks: React.Dispatch<React.SetStateAction<Block[]>>;
  boreholeId: number;
  setIsAddNewBlockButtonPressed: React.Dispatch<React.SetStateAction<boolean>>;
};

export function AddCavityBlockDetailsInputForm({ style, boreholeId, blocks, setBlocks, setIsAddNewBlockButtonPressed, ...otherProps }: AddCavityBlockDetailsInputFormProps) {
  const [dayWorkStatus, setDayWorkStatus] = useState<DayWorkStatus>({
    dayWorkStatusType: DAY_CONTINUE_WORK_TYPE,
    date: new Date(),
    time: new Date(),
    waterLevelInMetres: null,
    casingDepthInMetres: null,
  });
  const [topDepthInMetresStr, setTopDepthInMetresStr] = useState<string>('');
  const [baseDepthInMetresStr, setBaseDepthInMetresStr] = useState<string>('');
  const [description, setDescription] = useState<string>('');

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
      onPress={async () => {
        const newBlock: Block = checkAndReturnCavityBlock({
          blocks: blocks,
          boreholeId: boreholeId,
          dayWorkStatus: dayWorkStatus,
          topDepthInMetresStr: topDepthInMetresStr,
          baseDepthInMetresStr: baseDepthInMetresStr,
          description: description,
        });
        setBlocks(await addBlockAsync(blocks, newBlock));
        setIsAddNewBlockButtonPressed(false);
      }}
    />
    </>
  );
}
