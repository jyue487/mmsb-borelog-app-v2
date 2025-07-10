import { Button, Text, View, type ViewProps } from "react-native";

import { CORING_BLOCK_TYPE_ID } from "@/constants/BlockTypeId";
import { Block } from "@/types/Block";

export type CoringBlockDetailsInputFormProps = ViewProps & {
	boreholeId: number;
	addNewBlock: (block: Block) => void;
	setIsAddNewBlockButtonPressed: (isPressed: boolean) => void;
};

export function CoringBlockDetailsInputForm({ style, boreholeId, addNewBlock, setIsAddNewBlockButtonPressed, ...otherProps }: CoringBlockDetailsInputFormProps) {
	const newCoringBlock: Block = {
		id: 1, 
		blockTypeId: CORING_BLOCK_TYPE_ID,
		blockType: 'Coring',
		boreholeId: boreholeId, 
		blockId: 1,
		topDepthInMetres: 75,
		baseDepthInMetres: 75.09,
		rockDescription: 'Light grey, medium grey slightly fractured to fresh good LIMESTONE',
		coreRun: 1.5,
		coreRecovery: 100,
		rqd: 84,
	};

	return (
		<View>
			<Text>CoringBlockDetailsInputForm</Text>
			<Button
				title='Confirm'
				onPress={() => {
					addNewBlock(newCoringBlock);
					setIsAddNewBlockButtonPressed(false);
				}}
			/>
		</View>
	);
}