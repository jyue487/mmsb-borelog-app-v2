import React, { useState } from "react";
import { Button, type ViewProps } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { DayWorkStatus } from "@/constants/DayWorkStatus";
import { styles } from "@/constants/styles";
import { BaseBlock, Block, CORING_BLOCK_TYPE_ID } from "@/interfaces/Block";
import { CoringBlock } from "@/interfaces/CoringBlock";
import { checkAndReturnCoringBlock } from "@/utils/checkFunctions/checkAndReturnCoringBlock";
import { roundToDecimalPoint } from "@/utils/numbers";
import { CoringBlockInputQuestions } from "../../../inputQuestions/CoringBlockInputQuestions";
import { ColourProperties } from "@/interfaces/ColourProperties";
import { RockProperties } from "@/interfaces/RockProperties";

export type EditCoringBlockDetailsInputFormProps = ViewProps & {
	blocks: Block[];
	setBlocks: React.Dispatch<React.SetStateAction<Block[]>>;
	oldBlock: BaseBlock & CoringBlock;
	setIsEditState: React.Dispatch<React.SetStateAction<boolean>>;
};

export function EditCoringBlockDetailsInputForm({ style, blocks, setBlocks, oldBlock, setIsEditState, ...otherProps }: EditCoringBlockDetailsInputFormProps) {
	const [dayWorkStatus, setDayWorkStatus] = useState<DayWorkStatus>(oldBlock.dayWorkStatus);
	const [topDepthInMetresStr, setTopDepthInMetresStr] = useState<string>(oldBlock.topDepthInMetres.toFixed(3));
	const [coreRunInMetresStr, setCoreRunInMetresStr] = useState<string>(roundToDecimalPoint(oldBlock.coreRunInMetres, 3).toString());
	const [coreRecoveryInMetresStr, setCoreRecoveryInMetresStr] = useState<string>(roundToDecimalPoint(oldBlock.coreRecoveryInMetres, 3).toString());
	const [rqdInMetresStr, setRqdInMetresStr] = useState<string>(roundToDecimalPoint(oldBlock.rqdInMetres, 3).toString());
	const [colourProperties, setColourProperties] = useState<ColourProperties>(oldBlock.colourProperties);
	const [rockProperties, setRockProperties] = useState<RockProperties>(oldBlock.rockProperties);

	return (
		<GestureHandlerRootView style={styles.blockDetailsInputForm}>
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
				onPress={() => {
					const newBlock: Block = checkAndReturnCoringBlock({
						blocks: blocks,
						boreholeId: oldBlock.boreholeId,
						dayWorkStatus: dayWorkStatus,
						topDepthInMetresStr: topDepthInMetresStr,
						coreRunInMetresStr: coreRunInMetresStr,
						coreRecoveryInMetresStr: coreRecoveryInMetresStr,
						rqdInMetresStr: rqdInMetresStr,
						colourProperties: colourProperties,
						rockProperties: rockProperties,
					});
					setBlocks((blocks: Block[]) => {
						let rockSampleIndex: number = 1;
						return blocks.map((b: Block) => {
							if (b.blockTypeId !== CORING_BLOCK_TYPE_ID) {
								return b;
							}
							const updatedBlock: Block = (b === oldBlock) ? {...newBlock} : {...b};
							updatedBlock.id = b.id;
							updatedBlock.rockSampleIndex = (updatedBlock.coreRecoveryInPercentage === 0) ? -1 : rockSampleIndex++;
							return updatedBlock;
						});
					});
					setIsEditState(false);
				}}
			/>
			<Button 
				title='Cancel'
				onPress={() => setIsEditState(false)} 
			/>
		</GestureHandlerRootView>
	);
}
