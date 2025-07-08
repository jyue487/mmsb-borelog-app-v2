import { Button, Text, View, type ViewProps } from "react-native";

import { Block } from "@/types/Block";
import { CoringBlock } from "@/types/CoringBlock";
import { CORING_BLOCK_TYPE_ID } from "@/constants/BlockTypeId";

export type CoringBlockDetailsInputFormProps = ViewProps & {
	borehole_id: number;
	addNewBlock: (block: Block) => void;
	setIsAddNewBlockButtonPressed: (isPressed: boolean) => void;
};

export function CoringBlockDetailsInputForm({ style, borehole_id, addNewBlock, setIsAddNewBlockButtonPressed, ...otherProps }: CoringBlockDetailsInputFormProps) {
	const newCoringBlock: Block = {
		id: 1, 
		block_type_id: CORING_BLOCK_TYPE_ID,
		block_type: 'Coring',
		borehole_id: borehole_id, 
		block_id: 1,
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