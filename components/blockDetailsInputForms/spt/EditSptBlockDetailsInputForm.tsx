import React, { useState } from "react";
import { Button, View, type ViewProps } from "react-native";

import { DayWorkStatus } from "@/constants/DayWorkStatus";
import { styles } from "@/constants/styles";
import { BaseBlock, Block, SPT_BLOCK_TYPE_ID } from "@/interfaces/Block";
import { SptBlock } from "@/interfaces/SptBlock";
import { checkAndReturnSptBlock } from "@/utils/checkFunctions/checkAndReturnSptBlock";
import { SptBlockInputQuestions } from "../../inputQuestions/SptBlockInputQuestions";
import { ColourProperties } from "@/interfaces/ColourProperties";
import { SoilProperties } from "@/interfaces/SoilProperties";

export type EditSptBlockDetailsInputFormProps = ViewProps & {
	blocks: Block[];
	setBlocks: React.Dispatch<React.SetStateAction<Block[]>>;
	oldBlock: BaseBlock & SptBlock;
  setIsEditState: React.Dispatch<React.SetStateAction<boolean>>;
};

export function EditSptBlockDetailsInputForm({ style, blocks, setBlocks, oldBlock, setIsEditState, ...otherProps }: EditSptBlockDetailsInputFormProps) {
	const [dayWorkStatus, setDayWorkStatus] = useState<DayWorkStatus>(oldBlock.dayWorkStatus);
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
	const [colourProperties, setColourProperties] = useState<ColourProperties>(oldBlock.colourProperties);
	const [soilProperties, setSoilProperties] = useState<SoilProperties>(oldBlock.soilProperties);

	return (
		<View style={styles.blockDetailsInputForm}>
			<SptBlockInputQuestions 
				dayWorkStatus={dayWorkStatus} setDayWorkStatus={setDayWorkStatus}
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
				colourProperties={colourProperties} setColourProperties={setColourProperties}
				soilProperties={soilProperties} setSoilProperties={setSoilProperties}
			/>
			<Button
				title='Confirm'
				onPress={() => {
					const newBlock: Block = checkAndReturnSptBlock({
						blocks: blocks,
						boreholeId: oldBlock.boreholeId,
						dayWorkStatus: dayWorkStatus,
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
						colourProperties: colourProperties,
						soilProperties: soilProperties,
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
					setBlocks((blocks: Block[]) => {
						let sptIndex: number = 1;
						let disturbedSampleIndex: number = 1;
						return blocks.map((b: Block) => {
							if (b.blockTypeId !== SPT_BLOCK_TYPE_ID) {
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
		</View>
	);
}
