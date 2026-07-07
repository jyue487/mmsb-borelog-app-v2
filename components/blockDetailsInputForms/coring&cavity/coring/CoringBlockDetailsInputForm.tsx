import React, { useState } from "react";
import { Button } from "react-native";

import { DayWorkStatus } from "@/constants/DayWorkStatus";
import { styles } from "@/constants/styles";
import { BaseBlock, Block, CORING_BLOCK_TYPE_ID } from "@/interfaces/Block";
import { ColourProperties } from "@/interfaces/ColourProperties";
import { CoringBlock, createDefaultCoringBlock } from "@/interfaces/CoringBlock";
import { RockProperties } from "@/interfaces/RockProperties";
import { addBlockAsync } from "@/utils/block/addBlockFunctions/addBlockAsync";
import { editBlockAsync } from "@/utils/block/editBlockFunctions/editBlockAsync";
import { checkAndReturnCoringBlock } from "@/utils/block/checkFunctions/checkAndReturnCoringBlock";
import { isNonNegative, roundToDecimalPoint } from "@/utils/numbers";
import { CoringBlockInputQuestions } from "../../../inputQuestions/CoringBlockInputQuestions";
import { BlockDetailsInputFormProps, SpecificBlockDetailsInputFormProps } from "../../BlockDetailsInputForm";
import { depthInMetresToString } from "@/utils/depth";

export function CoringBlockDetailsInputForm({ boreholeId, inputBlock, onSubmitAsync, ...otherProps }: SpecificBlockDetailsInputFormProps) {
	const block: BaseBlock & CoringBlock = (inputBlock !== null && inputBlock.blockTypeId === CORING_BLOCK_TYPE_ID) ? inputBlock : createDefaultCoringBlock();
	const [dayWorkStatus, setDayWorkStatus] = useState<DayWorkStatus>(block.dayWorkStatus);
	const [topDepthInMetresStr, setTopDepthInMetresStr] = useState<string>(depthInMetresToString(block.topDepthInMetres));
	const [coreRunInMetresStr, setCoreRunInMetresStr] = useState<string>(isNonNegative(block.coreRunInMetres) ? roundToDecimalPoint(block.coreRunInMetres, 3).toString() : '');
	const [coreRecoveryInMetresStr, setCoreRecoveryInMetresStr] = useState<string>(isNonNegative(block.coreRecoveryInMetres) ? roundToDecimalPoint(block.coreRecoveryInMetres, 3).toString() : '');
	const [rqdInMetresStr, setRqdInMetresStr] = useState<string>(isNonNegative(block.rqdInMetres) ? roundToDecimalPoint(block.rqdInMetres, 3).toString() : '');
	const [colourProperties, setColourProperties] = useState<ColourProperties>(block.colourProperties);
	const [rockProperties, setRockProperties] = useState<RockProperties>(block.rockProperties);

	return (
		<>
      <CoringBlockInputQuestions 
        dayWorkStatus={dayWorkStatus} setDayWorkStatus={setDayWorkStatus}
        topDepthInMetresStr={topDepthInMetresStr} setTopDepthInMetresStr={setTopDepthInMetresStr}
        coreRunInMetresStr={coreRunInMetresStr} setCoreRunInMetresStr={setCoreRunInMetresStr}
        coreRecoveryInMetresStr={coreRecoveryInMetresStr} setCoreRecoveryInMetresStr={setCoreRecoveryInMetresStr}
        rqdInMetresStr={rqdInMetresStr} setRqdInMetresStr={setRqdInMetresStr}
        colourProperties={colourProperties} setColourProperties={setColourProperties}
        rockProperties={rockProperties} setRockProperties={setRockProperties}
      />
      <Button
        title='Confirm'
        color={styles.confirmButton.color}
        onPress={async () => {
          try {
            const newBlock: Block = checkAndReturnCoringBlock({
              boreholeId: boreholeId,
              dayWorkStatus: dayWorkStatus,
              topDepthInMetresStr: topDepthInMetresStr,
              coreRunInMetresStr: coreRunInMetresStr,
              coreRecoveryInMetresStr: coreRecoveryInMetresStr,
              rqdInMetresStr: rqdInMetresStr,
              colourProperties: colourProperties,
              rockProperties: rockProperties,
            });
            await onSubmitAsync(newBlock);
          } catch (err) {
            alert(err);
          }
        }}
      />
		</>
	);
}
