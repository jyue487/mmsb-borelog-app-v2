import React, { useState } from "react";
import { Button, type ViewProps } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { Colour } from "@/constants/colour";
import { DAY_CONTINUE_WORK_TYPE, DayWorkStatusType } from "@/constants/DayStatus";
import {
	DominantSoilType,
	SecondarySoilType
} from "@/constants/soil";
import { styles } from "@/constants/styles";
import { BaseBlock, Block, SPT_BLOCK_TYPE } from "@/interfaces/Block";
import { SptBlock } from "@/interfaces/SptBlock";
import { checkAndReturnSptBlock } from "@/utils/checkFunctions/checkAndReturnSptBlock";
import { SptInputQuestions } from "../../inputQuestions/SptInputQuestions";

export type EditSptBlockDetailsInputFormProps = ViewProps & {
	blocks: Block[];
	setBlocks: React.Dispatch<React.SetStateAction<Block[]>>;
	oldBlock: BaseBlock & SptBlock;
  setIsEditState: React.Dispatch<React.SetStateAction<boolean>>;
};

export function EditSptBlockDetailsInputForm({ style, blocks, setBlocks, oldBlock, setIsEditState, ...otherProps }: EditSptBlockDetailsInputFormProps) {
	const [dayWorkStatusType, setDayWorkStatusType] = useState<DayWorkStatusType>(oldBlock.dayWorkStatus.dayWorkStatusType);
	const [dayStartWorkDate, setDayStartWorkDate] = useState<Date>((oldBlock.dayWorkStatus.dayWorkStatusType === DAY_CONTINUE_WORK_TYPE) ? new Date() : oldBlock.dayWorkStatus.date);
	const [dayStartWorkTime, setDayStartWorkTime] = useState<Date>((oldBlock.dayWorkStatus.dayWorkStatusType === DAY_CONTINUE_WORK_TYPE) ? new Date() : oldBlock.dayWorkStatus.time);
	const [dayEndWorkDate, setDayEndWorkDate] = useState<Date>((oldBlock.dayWorkStatus.dayWorkStatusType === DAY_CONTINUE_WORK_TYPE) ? new Date() : oldBlock.dayWorkStatus.date);
	const [dayEndWorkTime, setDayEndWorkTime] = useState<Date>((oldBlock.dayWorkStatus.dayWorkStatusType === DAY_CONTINUE_WORK_TYPE) ? new Date() : oldBlock.dayWorkStatus.time);
	const [waterLevelInMetresStr, setWaterLevelInMetresStr] = useState<string>((oldBlock.dayWorkStatus.dayWorkStatusType === DAY_CONTINUE_WORK_TYPE) ? '' : oldBlock.dayWorkStatus.waterLevelInMetres?.toFixed(3) ?? '');
	const [casingDepthInMetresStr, setCasingDepthInMetresStr] = useState<string>((oldBlock.dayWorkStatus.dayWorkStatusType === DAY_CONTINUE_WORK_TYPE) ? '' : oldBlock.dayWorkStatus.casingDepthInMetres?.toFixed(3) ?? '');
	const [topDepthInMetresStr, setTopDepthInMetresStr] = useState<string>(oldBlock.topDepthInMetres.toFixed(3));
	const [seatingIncBlows1Str, setSeatingIncBlows1Str] = useState<string>(oldBlock.seatingIncBlows1.toString() ?? '');
	const [seatingIncBlows2Str, setSeatingIncBlows2Str] = useState<string>(oldBlock.seatingIncBlows2?.toString() ?? '');
	const [seatingIncPen1Str, setSeatingIncPen1Str] = useState<string>(oldBlock.seatingIncPen1.toString() ?? '');
	const [seatingIncPen2Str, setSeatingIncPen2Str] = useState<string>(oldBlock.seatingIncPen2?.toString() ?? '');
	const [mainIncBlows1Str, setMainIncBlows1Str] = useState<string>(oldBlock.mainIncBlows1.toString() ?? '');
	const [mainIncBlows2Str, setMainIncBlows2Str] = useState<string>(oldBlock.mainIncBlows2?.toString() ?? '');
	const [mainIncBlows3Str, setMainIncBlows3Str] = useState<string>(oldBlock.mainIncBlows3?.toString() ?? '');
	const [mainIncBlows4Str, setMainIncBlows4Str] = useState<string>(oldBlock.mainIncBlows4?.toString() ?? '');
	const [mainIncPen1Str, setMainIncPen1Str] = useState<string>(oldBlock.mainIncPen1.toString() ?? '');
	const [mainIncPen2Str, setMainIncPen2Str] = useState<string>(oldBlock.mainIncPen2?.toString() ?? '');
	const [mainIncPen3Str, setMainIncPen3Str] = useState<string>(oldBlock.mainIncPen3?.toString() ?? '');
	const [mainIncPen4Str, setMainIncPen4Str] = useState<string>(oldBlock.mainIncPen4?.toString() ?? '');
	const [isSeatingIncBlows1Active, setIsSeatingIncBlows1Active] = useState<boolean>(oldBlock.isSeatingIncBlows1Active);
	const [isSeatingIncBlows2Active, setIsSeatingIncBlows2Active] = useState<boolean>(oldBlock.isSeatingIncBlows2Active);
	const [isMainIncBlows1Active, setIsMainIncBlows1Active] = useState<boolean>(oldBlock.isMainIncBlows1Active);
	const [isMainIncBlows2Active, setIsMainIncBlows2Active] = useState<boolean>(oldBlock.isMainIncBlows2Active);
	const [isMainIncBlows3Active, setIsMainIncBlows3Active] = useState<boolean>(oldBlock.isMainIncBlows3Active);
	const [isMainIncBlows4Active, setIsMainIncBlows4Active] = useState<boolean>(oldBlock.isMainIncBlows4Active);
	const [isSeatingIncPen1Active, setIsSeatingIncPen1Active] = useState<boolean>(oldBlock.isSeatingIncPen1Active);
	const [isSeatingIncPen2Active, setIsSeatingIncPen2Active] = useState<boolean>(oldBlock.isSeatingIncPen2Active);
	const [isMainIncPen1Active, setIsMainIncPen1Active] = useState<boolean>(oldBlock.isMainIncPen1Active);
	const [isMainIncPen2Active, setIsMainIncPen2Active] = useState<boolean>(oldBlock.isMainIncPen2Active);
	const [isMainIncPen3Active, setIsMainIncPen3Active] = useState<boolean>(oldBlock.isMainIncPen3Active);
	const [isMainIncPen4Active, setIsMainIncPen4Active] = useState<boolean>(oldBlock.isMainIncPen4Active);
	const [recoveryLengthInMillimetresStr, setRecoveryLengthInMillimetresStr] = useState<string>(oldBlock.recoveryLengthInMillimetres.toString());
	const [dominantColour, setDominantColour] = useState<Colour | null>(oldBlock.dominantColour);
	const [secondaryColour, setSecondaryColour] = useState<Colour | null>(oldBlock.secondaryColour);
	const [dominantSoilType, setDominantSoilType] = useState<DominantSoilType | null>(oldBlock.dominantSoilType);
	const [secondarySoilType, setSecondarySoilType] = useState<SecondarySoilType | null>(oldBlock.secondarySoilType);
	const [otherProperties, setOtherProperties] = useState<string>(oldBlock.otherProperties);

	return (
		<GestureHandlerRootView style={styles.blockDetailsInputForm}>
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
						boreholeId: oldBlock.boreholeId,
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

					setBlocks((blocks: Block[]) => {
						let sptIndex: number = 1;
						let disturbedSampleIndex: number = 1;
						return blocks.map((b: Block) => {
							if (b.blockType !== SPT_BLOCK_TYPE) {
								return b;
							}
							const updatedBlock: Block = (b === oldBlock) ? {...newBlock} : {...b};
							updatedBlock.id = b.id;
							updatedBlock.sptIndex = sptIndex++;
							updatedBlock.disturbedSampleIndex = (updatedBlock.recoveryLengthInMillimetres === 0) ? -1 : disturbedSampleIndex++;
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
