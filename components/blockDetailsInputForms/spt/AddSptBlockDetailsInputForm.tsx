import React, { useState } from "react";
import { Button, StyleSheet, Text, TextInput, View, type ViewProps } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { Colour } from "@/constants/colour";
import { DAY_CONTINUE_WORK_TYPE, DayWorkStatusType } from "@/constants/DayStatus";
import {
	DominantSoilType,
	SecondarySoilType
} from "@/constants/soil";
import { Block } from "@/interfaces/Block";
import { checkAndReturnSptBlock } from "@/utils/checkFunctions/checkAndReturnSptBlock";
import { SptInputQuestions } from "@/components/inputQuestions/SptInputQuestions";

export type AddSptBlockDetailsInputFormProps = ViewProps & {
	blocks: Block[];
	setBlocks: React.Dispatch<React.SetStateAction<Block[]>>;
	boreholeId: number;
	setIsAddNewBlockButtonPressed: React.Dispatch<React.SetStateAction<boolean>>;
};

export function AddSptBlockDetailsInputForm({ style, blocks, setBlocks, boreholeId, setIsAddNewBlockButtonPressed, ...otherProps }: AddSptBlockDetailsInputFormProps) {
	const [dayWorkStatusType, setDayWorkStatusType] = useState<DayWorkStatusType>(DAY_CONTINUE_WORK_TYPE);
	const [dayStartWorkDate, setDayStartWorkDate] = useState<Date>(new Date());
	const [dayStartWorkTime, setDayStartWorkTime] = useState<Date>(new Date());
	const [dayEndWorkDate, setDayEndWorkDate] = useState<Date>(new Date());
	const [dayEndWorkTime, setDayEndWorkTime] = useState<Date>(new Date());
	const [waterLevelInMetresStr, setWaterLevelInMetresStr] = useState<string>('');
	const [casingDepthInMetresStr, setCasingDepthInMetresStr] = useState<string>('');
	const [topDepthInMetresStr, setTopDepthInMetresStr] = useState<string>('');
	const [seatingIncBlows1Str, setSeatingIncBlows1Str] = useState<string>('');
	const [seatingIncBlows2Str, setSeatingIncBlows2Str] = useState<string>('');
	const [seatingIncPen1Str, setSeatingIncPen1Str] = useState<string>('');
	const [seatingIncPen2Str, setSeatingIncPen2Str] = useState<string>('');
	const [mainIncBlows1Str, setMainIncBlows1Str] = useState<string>('');
	const [mainIncBlows2Str, setMainIncBlows2Str] = useState<string>('');
	const [mainIncBlows3Str, setMainIncBlows3Str] = useState<string>('');
	const [mainIncBlows4Str, setMainIncBlows4Str] = useState<string>('');
	const [mainIncPen1Str, setMainIncPen1Str] = useState<string>('');
	const [mainIncPen2Str, setMainIncPen2Str] = useState<string>('');
	const [mainIncPen3Str, setMainIncPen3Str] = useState<string>('');
	const [mainIncPen4Str, setMainIncPen4Str] = useState<string>('');
	const [isSeatingIncBlows1Active, setIsSeatingIncBlows1Active] = useState<boolean>(true);
	const [isSeatingIncBlows2Active, setIsSeatingIncBlows2Active] = useState<boolean>(false);
	const [isMainIncBlows1Active, setIsMainIncBlows1Active] = useState<boolean>(false);
	const [isMainIncBlows2Active, setIsMainIncBlows2Active] = useState<boolean>(false);
	const [isMainIncBlows3Active, setIsMainIncBlows3Active] = useState<boolean>(false);
	const [isMainIncBlows4Active, setIsMainIncBlows4Active] = useState<boolean>(false);
	const [isSeatingIncPen1Active, setIsSeatingIncPen1Active] = useState<boolean>(false);
	const [isSeatingIncPen2Active, setIsSeatingIncPen2Active] = useState<boolean>(false);
	const [isMainIncPen1Active, setIsMainIncPen1Active] = useState<boolean>(false);
	const [isMainIncPen2Active, setIsMainIncPen2Active] = useState<boolean>(false);
	const [isMainIncPen3Active, setIsMainIncPen3Active] = useState<boolean>(false);
	const [isMainIncPen4Active, setIsMainIncPen4Active] = useState<boolean>(false);
	const [recoveryLengthInMillimetresStr, setRecoveryLengthInMillimetresStr] = useState<string>('');
	const [dominantColour, setDominantColour] = useState<Colour | null>(null);
	const [secondaryColour, setSecondaryColour] = useState<Colour | null>(null);
	const [dominantSoilType, setDominantSoilType] = useState<DominantSoilType | null>(null);
	const [secondarySoilType, setSecondarySoilType] = useState<SecondarySoilType | null>(null);
	const [otherProperties, setOtherProperties] = useState<string>('');

	return (
		<>
		<SptInputQuestions 
			dayWorkStatusType={dayWorkStatusType} setDayWorkStatusType={setDayWorkStatusType}
			dayStartWorkDate={dayStartWorkDate} setDayStartWorkDate={setDayStartWorkDate}
			dayStartWorkTime={dayStartWorkTime} setDayStartWorkTime={setDayStartWorkTime}
			dayEndWorkDate={dayEndWorkDate} setDayEndWorkDate={setDayEndWorkDate}
			dayEndWorkTime={dayEndWorkTime} setDayEndWorkTime={setDayEndWorkTime}
			waterLevelInMetresStr={waterLevelInMetresStr} setWaterLevelInMetresStr={setWaterLevelInMetresStr}
			casingDepthInMetresStr={casingDepthInMetresStr} setCasingDepthInMetresStr={setCasingDepthInMetresStr}
			topDepthInMetresStr={topDepthInMetresStr} setTopDepthInMetresStr={setTopDepthInMetresStr}
			seatingIncBlows1Str={seatingIncBlows1Str} setSeatingIncBlows1Str={setSeatingIncBlows1Str}
			seatingIncBlows2Str={seatingIncBlows2Str} setSeatingIncBlows2Str={setSeatingIncBlows2Str}
			seatingIncPen1Str={seatingIncPen1Str} setSeatingIncPen1Str={setSeatingIncPen1Str}
			seatingIncPen2Str={seatingIncPen2Str} setSeatingIncPen2Str={setSeatingIncPen2Str}
			mainIncBlows1Str={mainIncBlows1Str} setMainIncBlows1Str={setMainIncBlows1Str}
			mainIncBlows2Str={mainIncBlows2Str} setMainIncBlows2Str={setMainIncBlows2Str}
			mainIncBlows3Str={mainIncBlows3Str} setMainIncBlows3Str={setMainIncBlows3Str}
			mainIncBlows4Str={mainIncBlows4Str} setMainIncBlows4Str={setMainIncBlows4Str}
			mainIncPen1Str={mainIncPen1Str} setMainIncPen1Str={setMainIncPen1Str}
			mainIncPen2Str={mainIncPen2Str} setMainIncPen2Str={setMainIncPen2Str}
			mainIncPen3Str={mainIncPen3Str} setMainIncPen3Str={setMainIncPen3Str}
			mainIncPen4Str={mainIncPen4Str} setMainIncPen4Str={setMainIncPen4Str}
			isSeatingIncBlows1Active={isSeatingIncBlows1Active} setIsSeatingIncBlows1Active={setIsSeatingIncBlows1Active}
			isSeatingIncBlows2Active={isSeatingIncBlows2Active} setIsSeatingIncBlows2Active={setIsSeatingIncBlows2Active}
			isMainIncBlows1Active={isMainIncBlows1Active} setIsMainIncBlows1Active={setIsMainIncBlows1Active}
			isMainIncBlows2Active={isMainIncBlows2Active} setIsMainIncBlows2Active={setIsMainIncBlows2Active}
			isMainIncBlows3Active={isMainIncBlows3Active} setIsMainIncBlows3Active={setIsMainIncBlows3Active}
			isMainIncBlows4Active={isMainIncBlows4Active} setIsMainIncBlows4Active={setIsMainIncBlows4Active}
			isSeatingIncPen1Active={isSeatingIncPen1Active} setIsSeatingIncPen1Active={setIsSeatingIncPen1Active}
			isSeatingIncPen2Active={isSeatingIncPen2Active} setIsSeatingIncPen2Active={setIsSeatingIncPen2Active}
			isMainIncPen1Active={isMainIncPen1Active} setIsMainIncPen1Active={setIsMainIncPen1Active}
			isMainIncPen2Active={isMainIncPen2Active} setIsMainIncPen2Active={setIsMainIncPen2Active}
			isMainIncPen3Active={isMainIncPen3Active} setIsMainIncPen3Active={setIsMainIncPen3Active}
			isMainIncPen4Active={isMainIncPen4Active} setIsMainIncPen4Active={setIsMainIncPen4Active}
			recoveryLengthInMillimetresStr={recoveryLengthInMillimetresStr} setRecoveryLengthInMillimetresStr={setRecoveryLengthInMillimetresStr}
			dominantColour={dominantColour} setDominantColour={setDominantColour}
			secondaryColour={secondaryColour} setSecondaryColour={setSecondaryColour}
			dominantSoilType={dominantSoilType} setDominantSoilType={setDominantSoilType}
			secondarySoilType={secondarySoilType} setSecondarySoilType={setSecondarySoilType}
			otherProperties={otherProperties} setOtherProperties={setOtherProperties}
		/>
		<Button
			title='Confirm'
			onPress={() => {
				const newBlock: Block | null = checkAndReturnSptBlock({
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
					seatingIncBlows1Str: seatingIncBlows1Str,
					seatingIncBlows2Str: seatingIncBlows2Str,
					seatingIncPen1Str: seatingIncPen1Str,
					seatingIncPen2Str: seatingIncPen2Str,
					mainIncBlows1Str: mainIncBlows1Str,
					mainIncBlows2Str: mainIncBlows2Str,
					mainIncBlows3Str: mainIncBlows3Str,
					mainIncBlows4Str: mainIncBlows4Str,
					mainIncPen1Str: mainIncPen1Str,
					mainIncPen2Str: mainIncPen2Str,
					mainIncPen3Str: mainIncPen3Str,
					mainIncPen4Str: mainIncPen4Str,
					recoveryLengthInMillimetresStr: recoveryLengthInMillimetresStr,
					dominantColour: dominantColour,
					secondaryColour: secondaryColour,
					dominantSoilType: dominantSoilType,
					secondarySoilType: secondarySoilType,
					otherProperties: otherProperties,
					isSeatingIncBlows1Active: isSeatingIncBlows1Active,
					isSeatingIncBlows2Active: isSeatingIncBlows2Active,
					isMainIncBlows1Active: isMainIncBlows1Active,
					isMainIncBlows2Active: isMainIncBlows2Active,
					isMainIncBlows3Active: isMainIncBlows3Active,
					isMainIncBlows4Active: isMainIncBlows4Active,
					isSeatingIncPen1Active: isSeatingIncPen1Active,
					isSeatingIncPen2Active: isSeatingIncPen2Active,
					isMainIncPen1Active: isMainIncPen1Active,
					isMainIncPen2Active: isMainIncPen2Active,
					isMainIncPen3Active: isMainIncPen3Active,
					isMainIncPen4Active: isMainIncPen4Active,
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
