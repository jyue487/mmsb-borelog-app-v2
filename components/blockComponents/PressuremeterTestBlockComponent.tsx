import { Pressable, Text, View, type ViewProps } from "react-native";

import { PressuremeterTestBlock } from '@/interfaces/PressuremeterTestBlock';
import { DayWorkStatusComponent } from "../DayWorkStatusComponent";
import { BaseBlock, Block } from "@/interfaces/Block";
import { useState } from "react";
import { EditPressuremeterTestBlockDetailsInputForm } from "@/components/blockDetailsInputForms/requiredInsituTests/pressuremeter/EditPressuremeterTestBlockDetailsInputForm";
import { styles } from "@/constants/styles";
import { PRESSUREMETER_TEST_SYMBOL } from "@/constants/symbol";

export type PressuremeterTestBlockProps = ViewProps & {
	block: BaseBlock & PressuremeterTestBlock;
	blocks: Block[];
	setBlocks: React.Dispatch<React.SetStateAction<Block[]>>;
};

export function PressuremeterTestBlockComponent({ block, blocks, setBlocks, ...otherProps }: PressuremeterTestBlockProps) {
	const [isEditState, setIsEditState] = useState<boolean>(false);
	
	if (isEditState) {
		return <EditPressuremeterTestBlockDetailsInputForm 
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
				<Text>{PRESSUREMETER_TEST_SYMBOL}{block.pressuremeterTestIndex}</Text>
				<View style={{ flex: 1 }}></View>
				<Text>{block.baseDepthInMetres.toFixed(3)}</Text>
			</View>
			<View style={{ flex: 1, gap: 20 }}>
				<DayWorkStatusComponent dayWorkStatus={block.dayWorkStatus}/>
				<Text>{block.description}</Text>
			</View>
		</Pressable>
	);
}