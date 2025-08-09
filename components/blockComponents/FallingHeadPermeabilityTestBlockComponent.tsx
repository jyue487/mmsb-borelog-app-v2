import { Pressable, Text, View, type ViewProps } from "react-native";

import { EditFallingHeadPermeabilityTestBlockDetailsInputForm } from "@/components/blockDetailsInputForms/requiredInsituTests/permeability/fallingHead/EditFallingHeadPermeabilityTestBlockDetailsInputForm";
import { styles } from "@/constants/styles";
import { FALLING_HEAD_PERMEABILITY_TEST_SYMBOL } from "@/constants/symbol";
import { BaseBlock, Block } from "@/interfaces/Block";
import { FallingHeadPermeabilityTestBlock } from '@/interfaces/FallingHeadPermeabilityTestBlock';
import { useState } from "react";
import { DayWorkStatusComponent } from "../dayWorkStatus/DayWorkStatusComponent";

export type FallingHeadPermeabilityTestBlockProps = ViewProps & {
	block: BaseBlock & FallingHeadPermeabilityTestBlock;
	blocks: Block[];
	setBlocks: React.Dispatch<React.SetStateAction<Block[]>>;
};

export function FallingHeadPermeabilityTestBlockComponent({ block, blocks, setBlocks, ...otherProps }: FallingHeadPermeabilityTestBlockProps) {
	const [isEditState, setIsEditState] = useState<boolean>(false);
	
	if (isEditState) {
		return <EditFallingHeadPermeabilityTestBlockDetailsInputForm 
			blocks={blocks}
			setBlocks={setBlocks}
			oldBlock={block}
			setIsEditState={setIsEditState}
		/>;
	}
	
	return (
		<Pressable 
			onLongPress={() => setIsEditState(true)}
			style={({ pressed }) => [
				{ flexDirection: 'row'}, 
				pressed && { transform: [{ scale: 1.02 }], backgroundColor: 'white' },
				styles.block,
			]} 
			{...otherProps}>
			<View style={{ backgroundColor: 'red', height: '100%', width: 70, paddingHorizontal: 1, alignItems: 'center'}}>
				<Text>{block.topDepthInMetres.toFixed(3)}</Text>
				<View style={{ flex: 1 }}></View>
				<Text>{FALLING_HEAD_PERMEABILITY_TEST_SYMBOL}{block.permeabilityTestIndex}</Text>
				<View style={{ flex: 1 }}></View>
				<Text>{(block.topDepthInMetres === block.baseDepthInMetres) ? '' : block.baseDepthInMetres.toFixed(3)}</Text>
			</View>
			<View style={{ flex: 1, gap: 20 }}>
				<DayWorkStatusComponent dayWorkStatus={block.dayWorkStatus}/>
				<Text>{block.description}</Text>
			</View>
		</Pressable>
	);
}