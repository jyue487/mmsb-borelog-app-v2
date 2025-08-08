import React, { useState } from "react";
import { Button, View, type ViewProps } from "react-native";

import { UndisturbedSampleInputQuestions } from "@/components/inputQuestions/UndisturbedSampleInputQuestions";
import { DayWorkStatus } from "@/constants/DayWorkStatus";
import { styles } from "@/constants/styles";
import { BaseBlock, Block, UD_BLOCK_TYPE_ID } from "@/interfaces/Block";
import { ColourProperties } from "@/interfaces/ColourProperties";
import { SoilProperties } from "@/interfaces/SoilProperties";
import { UdBlock } from "@/interfaces/UdBlock";
import { checkAndReturnUndisturbedSampleBlock } from "@/utils/checkFunctions/checkAndReturnUndisturbedSampleBlock";
import { roundToDecimalPoint } from "@/utils/numbers";
import { editBlockAsync } from "@/utils/editBlockFunctions/editBlockAsync";

export type EditUdBlockDetailsInputFormProps = ViewProps & {
  blocks: Block[];
  setBlocks: React.Dispatch<React.SetStateAction<Block[]>>;
  oldBlock: BaseBlock & UdBlock;
  setIsEditState: React.Dispatch<React.SetStateAction<boolean>>;
};

export function EditUdBlockDetailsInputForm({ style, blocks, setBlocks, oldBlock, setIsEditState, ...otherProps }: EditUdBlockDetailsInputFormProps) {
  const [dayWorkStatus, setDayWorkStatus] = useState<DayWorkStatus>(oldBlock.dayWorkStatus);
  const [topDepthInMetresStr, setTopDepthInMetresStr] = useState<string>(oldBlock.topDepthInMetres.toFixed(3));
  const [penetrationDepthInMetresStr, setPenetrationDepthInMetresStr] = useState<string>(roundToDecimalPoint(oldBlock.penetrationDepthInMetres, 3).toString());
  const [recoveryLengthInMetresStr, setRecoveryLengthInMetresStr] = useState<string>(roundToDecimalPoint(oldBlock.recoveryLengthInMetres, 3).toString());
  const [topColourProperties, setTopColourProperties] = useState<ColourProperties>(oldBlock.topColourProperties);
  const [topSoilProperties, setTopSoilProperties] = useState<SoilProperties>(oldBlock.topSoilProperties);
  const [baseDitto, setBaseDitto] = useState<boolean>(oldBlock.baseDitto);
  const [bottomColourProperties, setBottomColourProperties] = useState<ColourProperties>(oldBlock.bottomColourProperties);
  const [bottomSoilProperties, setBottomSoilProperties] = useState<SoilProperties>(oldBlock.bottomSoilProperties);

  return (
    <View style={styles.blockDetailsInputForm}>
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
        onPress={async () => {
          const newBlock: Block = checkAndReturnUndisturbedSampleBlock({
            undisturbedSampleBlockTypeId: UD_BLOCK_TYPE_ID,
            blocks: blocks,
            boreholeId: oldBlock.boreholeId, 
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
          setBlocks(await editBlockAsync(blocks, oldBlock.id, newBlock));
          setIsEditState(false);
        }}
      />
      <Button 
        title='Cancel'
        onPress={() => setIsEditState(false)} 
      />
    </View>
  );
}
