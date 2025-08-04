import { Pressable, Text, View, type ViewProps } from "react-native";

import { ConstantHeadPermeabilityTestBlock } from '@/interfaces/ConstantHeadPermeabilityTestBlock';
import { DayWorkStatusComponent } from "../DayWorkStatusComponent";
import { BaseBlock, Block } from "@/interfaces/Block";
import { useState } from "react";
import { EditConstantHeadPermeabilityTestBlockDetailsInputForm } from "@/components/blockDetailsInputForms/requiredInsituTests/permeability/constantHead/EditConstantHeadPermeabilityTestBlockDetailsInputForm";
import { styles } from "@/constants/styles";
import { CONSTANT_HEAD_PERMEABILITY_TEST_SYMBOL } from "@/constants/symbol";

export type ConstantHeadPermeabilityTestBlockProps = ViewProps & {
	block: BaseBlock & ConstantHeadPermeabilityTestBlock;
	blocks: Block[];
	setBlocks: React.Dispatch<React.SetStateAction<Block[]>>;
};

export function ConstantHeadPermeabilityTestBlockComponent({ block, blocks, setBlocks, ...otherProps }: ConstantHeadPermeabilityTestBlockProps) {
	const [isEditState, setIsEditState] = useState<boolean>(false);
	
	if (isEditState) {
		return <EditConstantHeadPermeabilityTestBlockDetailsInputForm 
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
				<Text>{CONSTANT_HEAD_PERMEABILITY_TEST_SYMBOL}{block.permeabilityTestIndex}</Text>
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