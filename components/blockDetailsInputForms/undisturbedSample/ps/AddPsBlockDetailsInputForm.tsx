import React, { useState } from "react";
import { Button, type ViewProps } from "react-native";

import { DAY_CONTINUE_WORK_TYPE, DayWorkStatus, DayWorkStatusType } from "@/constants/DayWorkStatus";
import { Block, PS_BLOCK_TYPE_ID } from "@/interfaces/Block";
import { UndisturbedSampleInputQuestions } from "@/components/inputQuestions/UndisturbedSampleInputQuestions";
import { checkAndReturnUndisturbedSampleBlock } from "@/utils/checkFunctions/checkAndReturnUndisturbedSampleBlock";
import { createDefaultSoilProperties, SoilProperties } from "@/interfaces/SoilProperties";
import { ColourProperties } from "@/interfaces/ColourProperties";
import { addBlockAsync } from "@/utils/addBlockFunctions/addBlockAsync";
import { styles } from "@/constants/styles";

export type AddPsBlockDetailsInputFormProps = ViewProps & {
  boreholeId: string;
  blocks: Block[];
  setBlocks: React.Dispatch<React.SetStateAction<Block[]>>;
  setIsAddNewBlockButtonPressed: React.Dispatch<React.SetStateAction<boolean>>;
};

export function AddPsBlockDetailsInputForm({ style, boreholeId, blocks, setBlocks, setIsAddNewBlockButtonPressed, ...otherProps }: AddPsBlockDetailsInputFormProps) {
  const [dayWorkStatus, setDayWorkStatus] = useState<DayWorkStatus>({
    dayWorkStatusType: DAY_CONTINUE_WORK_TYPE,
    date: new Date(),
    time: new Date(),
    waterLevelInMetres: null,
    casingDepthInMetres: null,
  });
  const [topDepthInMetresStr, setTopDepthInMetresStr] = useState<string>('');
  const [penetrationDepthInMetresStr, setPenetrationDepthInMetresStr] = useState<string>('');
  const [recoveryLengthInMetresStr, setRecoveryLengthInMetresStr] = useState<string>('');
  const [topColourProperties, setTopColourProperties] = useState<ColourProperties>({
    dominantColour: null,
    secondaryColour: null,
  });
  const [topSoilProperties, setTopSoilProperties] = useState<SoilProperties>(() => createDefaultSoilProperties());
  const [baseDitto, setBaseDitto] = useState<boolean>(true);
  const [bottomColourProperties, setBottomColourProperties] = useState<ColourProperties>({
    dominantColour: null,
    secondaryColour: null,
  });
  const [bottomSoilProperties, setBottomSoilProperties] = useState<SoilProperties>(() => createDefaultSoilProperties());

  return (
    <>
    <UndisturbedSampleInputQuestions 
      dayWorkStatus={dayWorkStatus} setDayWorkStatus={setDayWorkStatus}
      topDepthInMetresStr={topDepthInMetresStr} setTopDepthInMetresStr={setTopDepthInMetresStr}
      penetrationDepthInMetresStr={penetrationDepthInMetresStr} setPenetrationDepthInMetresStr={setPenetrationDepthInMetresStr}
      recoveryLengthInMetresStr={recoveryLengthInMetresStr} setRecoveryLengthInMetresStr={setRecoveryLengthInMetresStr}
      topColourProperties={topColourProperties} setTopColourProperties={setTopColourProperties}
      topSoilProperties={topSoilProperties} setTopSoilProperties={setTopSoilProperties}
      baseDitto={baseDitto} setBaseDitto={setBaseDitto}
      bottomColourProperties={bottomColourProperties} setBottomColourProperties={setBottomColourProperties}
      bottomSoilProperties={bottomSoilProperties} setBottomSoilProperties={setBottomSoilProperties}
    />
    <Button
      title='Confirm'
      color={styles.confirmButton.color}
      onPress={async () => {
        const newBlock: Block = checkAndReturnUndisturbedSampleBlock({
          undisturbedSampleBlockTypeId: PS_BLOCK_TYPE_ID,
          blocks: blocks,
          boreholeId: boreholeId, 
          dayWorkStatus: dayWorkStatus,
          topDepthInMetresStr: topDepthInMetresStr,
          penetrationDepthInMetresStr: penetrationDepthInMetresStr,
          recoveryLengthInMetresStr: recoveryLengthInMetresStr,
          topColourProperties: topColourProperties,
          topSoilProperties: topSoilProperties,
          baseDitto: baseDitto,
          bottomColourProperties: bottomColourProperties,
          bottomSoilProperties: bottomSoilProperties,
        });
        setBlocks(await addBlockAsync(blocks, newBlock));
        setIsAddNewBlockButtonPressed(false);
      }}
    />
    </>
  );
}
