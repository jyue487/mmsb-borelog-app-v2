import { Pressable, Text, View, type ViewProps } from "react-native";

import { EditLugeonTestBlockDetailsInputForm } from "@/components/blockDetailsInputForms/requiredInsituTests/lugeon/EditLugeonTestBlockDetailsInputForm";
import { styles } from "@/constants/styles";
import { LUGEON_TEST_SYMBOL } from "@/constants/symbol";
import { BaseBlock, Block } from "@/interfaces/Block";
import { LugeonTestBlock } from '@/interfaces/LugeonTestBlock';
import { useState } from "react";
import { DayWorkStatusComponent } from "../dayWorkStatus/DayWorkStatusComponent";

export type LugeonTestBlockProps = ViewProps & {
	block: BaseBlock & LugeonTestBlock;
	blocks: Block[];
	setBlocks: React.Dispatch<React.SetStateAction<Block[]>>;
};

export function LugeonTestBlockComponent({ block, blocks, setBlocks, ...otherProps }: LugeonTestBlockProps) {
	const [isEditState, setIsEditState] = useState<boolean>(false);
	
	if (isEditState) {
		return <EditLugeonTestBlockDetailsInputForm 
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
				<Text>{LUGEON_TEST_SYMBOL}{block.lugeonTestIndex}</Text>
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