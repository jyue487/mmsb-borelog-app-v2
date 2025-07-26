import React, { useState } from "react";
import { Button, type ViewProps } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { DAY_CONTINUE_WORK_TYPE, DayWorkStatusType } from "@/constants/DayStatus";
import { Colour } from "@/constants/colour";
import { RockType } from "@/constants/rock";
import { Block } from "@/interfaces/Block";
import { checkAndReturnCoringBlock } from "@/utils/checkFunctions/checkAndReturnCoringBlock";
import { CoringInputQuestions } from "../../../inputQuestions/CoringInputQuestions";

export type AddCoringBlockDetailsInputFormProps = ViewProps & {
	boreholeId: number;
	blocks: Block[];
	setBlocks: React.Dispatch<React.SetStateAction<Block[]>>;
	setIsAddNewBlockButtonPressed: React.Dispatch<React.SetStateAction<boolean>>;
};

export function AddCoringBlockDetailsInputForm({ style, boreholeId, blocks, setBlocks, setIsAddNewBlockButtonPressed, ...otherProps }: AddCoringBlockDetailsInputFormProps) {
	const [dayWorkStatusType, setDayWorkStatusType] = useState<DayWorkStatusType>(DAY_CONTINUE_WORK_TYPE);
	const [dayStartWorkDate, setDayStartWorkDate] = useState<Date>(new Date());
	const [dayStartWorkTime, setDayStartWorkTime] = useState<Date>(new Date());
	const [dayEndWorkDate, setDayEndWorkDate] = useState<Date>(new Date());
	const [dayEndWorkTime, setDayEndWorkTime] = useState<Date>(new Date());
	const [waterLevelInMetresStr, setWaterLevelInMetresStr] = useState<string>('');
	const [casingDepthInMetresStr, setCasingDepthInMetresStr] = useState<string>('');
	const [topDepthInMetresStr, setTopDepthInMetresStr] = useState<string>('');
	const [coreRunInMetresStr, setCoreRunInMetresStr] = useState<string>('');
	const [coreRecoveryInMetresStr, setCoreRecoveryInMetresStr] = useState<string>('');
	const [rqdInMetresStr, setRqdInMetresStr] = useState<string>('');
	const [dominantColour, setDominantColour] = useState<Colour | null>(null);
	const [isSelectDominantColourPressed, setIsSelectDominantColourPressed] = useState<boolean>(false);
	const [secondaryColour, setSecondaryColour] = useState<Colour | null>(null);
	const [isSelectSecondaryColourPressed, setIsSelectSecondaryColourPressed] = useState<boolean>(false);
	const [rockType, setRockType] = useState<RockType | null>(null);
	const [isSelectRockTypePressed, setIsSelectRockTypePressed] = useState<boolean>(false);
	const [otherRockType, setOtherRockType] = useState<string>('');
	const [otherProperties, setOtherProperties] = useState<string>('');
	const [isSelectOtherPropertiesPressed, setIsSelectOtherPropertiesPressed] = useState<boolean>(false);

	return (
		<>
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
					boreholeId: boreholeId,
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
				setBlocks(blocks => [...blocks, newBlock]);
				setIsAddNewBlockButtonPressed(false);
			}}
		/>
		</>
	);
}
