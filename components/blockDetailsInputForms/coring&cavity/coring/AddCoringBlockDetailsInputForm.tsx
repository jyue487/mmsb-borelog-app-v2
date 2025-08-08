import React, { useState } from "react";
import { Button, type ViewProps } from "react-native";

import { DAY_CONTINUE_WORK_TYPE, DayWorkStatus, DayWorkStatusType } from "@/constants/DayWorkStatus";
import { BaseBlock, Block } from "@/interfaces/Block";
import { checkAndReturnCoringBlock } from "@/utils/checkFunctions/checkAndReturnCoringBlock";
import { CoringBlockInputQuestions } from "../../../inputQuestions/CoringBlockInputQuestions";
import { ColourProperties } from "@/interfaces/ColourProperties";
import { RockProperties } from "@/interfaces/RockProperties";
import { CoringBlock } from "@/interfaces/CoringBlock";
import { addBlockDbAsync } from "@/db/blocks/addBlockDbAsync"; 
import { addBlockAsync } from "@/utils/addBlockFunctions/addBlockAsync";

export type AddCoringBlockDetailsInputFormProps = ViewProps & {
	boreholeId: number;
	blocks: Block[];
	setBlocks: React.Dispatch<React.SetStateAction<Block[]>>;
	setIsAddNewBlockButtonPressed: React.Dispatch<React.SetStateAction<boolean>>;
};

export function AddCoringBlockDetailsInputForm({ style, boreholeId, blocks, setBlocks, setIsAddNewBlockButtonPressed, ...otherProps }: AddCoringBlockDetailsInputFormProps) {
	const [dayWorkStatus, setDayWorkStatus] = useState<DayWorkStatus>({
		dayWorkStatusType: DAY_CONTINUE_WORK_TYPE,
		date: new Date(),
		time: new Date(),
		waterLevelInMetres: null,
		casingDepthInMetres: null,
	});
	const [topDepthInMetresStr, setTopDepthInMetresStr] = useState<string>('');
	const [coreRunInMetresStr, setCoreRunInMetresStr] = useState<string>('');
	const [coreRecoveryInMetresStr, setCoreRecoveryInMetresStr] = useState<string>('');
	const [rqdInMetresStr, setRqdInMetresStr] = useState<string>('');
	const [colourProperties, setColourProperties] = useState<ColourProperties>({
		dominantColour: null,
		secondaryColour: null,
	});
	const [rockProperties, setRockProperties] = useState<RockProperties>({
		rockType: null,
		otherRockType: '',
		otherProperties: '',
	});

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
			onPress={async () => {
				const newBlock: Block = checkAndReturnCoringBlock({
					blocks: blocks,
					boreholeId: boreholeId,
					dayWorkStatus: dayWorkStatus,
					topDepthInMetresStr: topDepthInMetresStr,
					coreRunInMetresStr: coreRunInMetresStr,
					coreRecoveryInMetresStr: coreRecoveryInMetresStr,
					rqdInMetresStr: rqdInMetresStr,
					colourProperties: colourProperties,
					rockProperties: rockProperties,
				});
				setBlocks(await addBlockAsync(blocks, newBlock));
				setIsAddNewBlockButtonPressed(false);
			}}
		/>
		</>
	);
}
