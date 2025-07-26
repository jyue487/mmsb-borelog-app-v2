import React, { useState } from "react";
import { Button, StyleSheet, type ViewProps } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { CORING_BLOCK_TYPE_ID } from "@/constants/BlockTypeId";
import { DAY_CONTINUE_WORK_TYPE, DayWorkStatus, DayWorkStatusType } from "@/constants/DayStatus";
import { Colour } from "@/constants/colour";
import { RockType } from "@/constants/rock";
import { BaseBlock, Block, CORING_BLOCK_TYPE } from "@/interfaces/Block";
import { checkAndReturnDayWorkStatus } from "@/utils/checkFunctions/checkAndReturnDayWorkStatus";
import { stringToDecimalPoint } from "@/utils/numbers";
import { CoringInputQuestions } from "../../../inputQuestions/CoringInputQuestions";
import { checkAndReturnCoringBlock } from "@/utils/checkFunctions/checkAndReturnCoringBlock";
import { CoringBlock } from "@/interfaces/CoringBlock";
import { styles } from "@/constants/styles";

export type EditCoringBlockDetailsInputFormProps = ViewProps & {
	blocks: Block[];
	setBlocks: React.Dispatch<React.SetStateAction<Block[]>>;
	oldBlock: BaseBlock & CoringBlock;
	setIsEditState: React.Dispatch<React.SetStateAction<boolean>>;
};

export function EditCoringBlockDetailsInputForm({ style, blocks, setBlocks, oldBlock, setIsEditState, ...otherProps }: EditCoringBlockDetailsInputFormProps) {
	const [dayWorkStatusType, setDayWorkStatusType] = useState<DayWorkStatusType>(oldBlock.dayWorkStatus.dayWorkStatusType);
	const [dayStartWorkDate, setDayStartWorkDate] = useState<Date>((oldBlock.dayWorkStatus.dayWorkStatusType === DAY_CONTINUE_WORK_TYPE) ? new Date() : oldBlock.dayWorkStatus.date);
	const [dayStartWorkTime, setDayStartWorkTime] = useState<Date>((oldBlock.dayWorkStatus.dayWorkStatusType === DAY_CONTINUE_WORK_TYPE) ? new Date() : oldBlock.dayWorkStatus.time);
	const [dayEndWorkDate, setDayEndWorkDate] = useState<Date>((oldBlock.dayWorkStatus.dayWorkStatusType === DAY_CONTINUE_WORK_TYPE) ? new Date() : oldBlock.dayWorkStatus.date);
	const [dayEndWorkTime, setDayEndWorkTime] = useState<Date>((oldBlock.dayWorkStatus.dayWorkStatusType === DAY_CONTINUE_WORK_TYPE) ? new Date() : oldBlock.dayWorkStatus.time);
	const [waterLevelInMetresStr, setWaterLevelInMetresStr] = useState<string>((oldBlock.dayWorkStatus.dayWorkStatusType === DAY_CONTINUE_WORK_TYPE) ? '' : oldBlock.dayWorkStatus.waterLevelInMetres?.toFixed(3) ?? '');
	const [casingDepthInMetresStr, setCasingDepthInMetresStr] = useState<string>((oldBlock.dayWorkStatus.dayWorkStatusType === DAY_CONTINUE_WORK_TYPE) ? '' : oldBlock.dayWorkStatus.casingDepthInMetres?.toFixed(3) ?? '');
	const [topDepthInMetresStr, setTopDepthInMetresStr] = useState<string>(oldBlock.topDepthInMetres.toFixed(3));
	const [coreRunInMetresStr, setCoreRunInMetresStr] = useState<string>(oldBlock.coreRunInMetres.toFixed(3));
	const [coreRecoveryInMetresStr, setCoreRecoveryInMetresStr] = useState<string>(oldBlock.coreRecoveryInMetres.toFixed(3));
	const [rqdInMetresStr, setRqdInMetresStr] = useState<string>(oldBlock.rqdInMetres.toFixed(3));
	const [dominantColour, setDominantColour] = useState<Colour | null>(oldBlock.dominantColour);
	const [isSelectDominantColourPressed, setIsSelectDominantColourPressed] = useState<boolean>(false);
	const [secondaryColour, setSecondaryColour] = useState<Colour | null>(oldBlock.secondaryColour);
	const [isSelectSecondaryColourPressed, setIsSelectSecondaryColourPressed] = useState<boolean>(false);
	const [rockType, setRockType] = useState<RockType | null>(oldBlock.rockType);
	const [isSelectRockTypePressed, setIsSelectRockTypePressed] = useState<boolean>(false);
	const [otherRockType, setOtherRockType] = useState<string>(oldBlock.otherRockType);
	const [otherProperties, setOtherProperties] = useState<string>(oldBlock.otherProperties);
	const [isSelectOtherPropertiesPressed, setIsSelectOtherPropertiesPressed] = useState<boolean>(false);

	return (
		<GestureHandlerRootView style={styles.inputForm}>
			<CoringInputQuestions 
				dayWorkStatusType={dayWorkStatusType} setDayWorkStatusType={setDayWorkStatusType}
				dayStartWorkDate={dayStartWorkDate} setDayStartWorkDate={setDayStartWorkDate}
				dayStartWorkTime={dayStartWorkTime} setDayStartWorkTime={setDayStartWorkTime}
				dayEndWorkDate={dayEndWorkDate} setDayEndWorkDate={setDayEndWorkDate}
				dayEndWorkTime={dayEndWorkTime} setDayEndWorkTime={setDayEndWorkTime}
				waterLevelInMetresStr={waterLevelInMetresStr} setWaterLevelInMetresStr={setWaterLevelInMetresStr}
				casingDepthInMetresStr={casingDepthInMetresStr} setCasingDepthInMetresStr={setCasingDepthInMetresStr}
				topDepthInMetresStr={topDepthInMetresStr} setTopDepthInMetresStr={setTopDepthInMetresStr}
				coreRunInMetresStr={coreRunInMetresStr} setCoreRunInMetresStr={setCoreRunInMetresStr}
				coreRecoveryInMetresStr={coreRecoveryInMetresStr} setCoreRecoveryInMetresStr={setCoreRecoveryInMetresStr}
				rqdInMetresStr={rqdInMetresStr} setRqdInMetresStr={setRqdInMetresStr}
				dominantColour={dominantColour} setDominantColour={setDominantColour}
				isSelectDominantColourPressed={isSelectDominantColourPressed} setIsSelectDominantColourPressed={setIsSelectDominantColourPressed}
				secondaryColour={secondaryColour} setSecondaryColour={setSecondaryColour}
				isSelectSecondaryColourPressed={isSelectSecondaryColourPressed} setIsSelectSecondaryColourPressed={setIsSelectSecondaryColourPressed}
				rockType={rockType} setRockType={setRockType}
				isSelectRockTypePressed={isSelectRockTypePressed} setIsSelectRockTypePressed={setIsSelectRockTypePressed}
				otherRockType={otherRockType} setOtherRockType={setOtherRockType}
				otherProperties={otherProperties} setOtherProperties={setOtherProperties}
				isSelectOtherPropertiesPressed={isSelectOtherPropertiesPressed} setIsSelectOtherPropertiesPressed={setIsSelectOtherPropertiesPressed}
			/>
			<Button
				title='Confirm'
				onPress={() => {
					const newBlock: Block | null = checkAndReturnCoringBlock({
						blocks: blocks,
						boreholeId: oldBlock.boreholeId,
						dayWorkStatusType: dayWorkStatusType,
						dayStartWorkDate: dayStartWorkDate,
						dayStartWorkTime: dayStartWorkTime,
						dayEndWorkDate: dayEndWorkDate,
						dayEndWorkTime: dayEndWorkTime,
						waterLevelInMetresStr: waterLevelInMetresStr,
						casingDepthInMetresStr: casingDepthInMetresStr,
						topDepthInMetresStr: topDepthInMetresStr,
						coreRunInMetresStr: coreRunInMetresStr,
						coreRecoveryInMetresStr: coreRecoveryInMetresStr,
						rqdInMetresStr: rqdInMetresStr,
						dominantColour: dominantColour,
						secondaryColour: secondaryColour,
						rockType: rockType,
						otherRockType: otherRockType,
						otherProperties: otherProperties,
					});
					if (!newBlock) {
						return;
					}

					setBlocks((blocks: Block[]) => {
						let rockSampleIndex: number = 1;
						return blocks.map((b: Block) => {
							if (b.blockType !== CORING_BLOCK_TYPE) {
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
