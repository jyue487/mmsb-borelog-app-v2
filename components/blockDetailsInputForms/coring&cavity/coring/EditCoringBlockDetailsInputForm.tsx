import React, { useState } from "react";
import { Button, type ViewProps } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { DAY_CONTINUE_WORK_TYPE, DayWorkStatusType } from "@/constants/DayStatus";
import { Colour } from "@/constants/colour";
import { RockType } from "@/constants/rock";
import { styles } from "@/constants/styles";
import { BaseBlock, Block, CORING_BLOCK_TYPE_ID } from "@/interfaces/Block";
import { CoringBlock } from "@/interfaces/CoringBlock";
import { checkAndReturnCoringBlock } from "@/utils/checkFunctions/checkAndReturnCoringBlock";
import { roundToDecimalPoint } from "@/utils/numbers";
import { CoringInputQuestions } from "../../../inputQuestions/CoringInputQuestions";

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
	const [waterLevelInMetresStr, setWaterLevelInMetresStr] = useState<string>((oldBlock.dayWorkStatus.dayWorkStatusType === DAY_CONTINUE_WORK_TYPE) ? '' : oldBlock.dayWorkStatus.waterLevelInMetres?.toFixed(2) ?? '');
	const [casingDepthInMetresStr, setCasingDepthInMetresStr] = useState<string>((oldBlock.dayWorkStatus.dayWorkStatusType === DAY_CONTINUE_WORK_TYPE) ? '' : oldBlock.dayWorkStatus.casingDepthInMetres?.toFixed(2) ?? '');
	const [topDepthInMetresStr, setTopDepthInMetresStr] = useState<string>(oldBlock.topDepthInMetres.toFixed(3));
	const [coreRunInMetresStr, setCoreRunInMetresStr] = useState<string>(roundToDecimalPoint(oldBlock.coreRunInMetres, 3).toString());
	const [coreRecoveryInMetresStr, setCoreRecoveryInMetresStr] = useState<string>(roundToDecimalPoint(oldBlock.coreRecoveryInMetres, 3).toString());
	const [rqdInMetresStr, setRqdInMetresStr] = useState<string>(roundToDecimalPoint(oldBlock.rqdInMetres, 3).toString());
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
		<GestureHandlerRootView style={styles.blockDetailsInputForm}>
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
