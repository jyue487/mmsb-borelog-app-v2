import { Pressable, Text, View, type ViewProps } from "react-native";

import { EndOfBoreholeBlock } from '@/interfaces/EndOfBoreholeBlock';
import { DayWorkStatusComponent } from "../DayWorkStatusComponent";
import { useState } from "react";
import { EditEndOfBoreholeBlockDetailsInputForm } from "@/components/blockDetailsInputForms/endOfBorehole/EditEndOfBoreholeBlockDetailsInputForm";
import { BaseBlock, Block } from "@/interfaces/Block";
import { styles } from "@/constants/styles";

export type EndOfBoreholeBlockProps = ViewProps & {
	block: BaseBlock & EndOfBoreholeBlock;
	blocks: Block[];
	setBlocks: React.Dispatch<React.SetStateAction<Block[]>>;
};

export function EndOfBoreholeBlockComponent({ block, blocks, setBlocks, ...otherProps }: EndOfBoreholeBlockProps) {
	const [isEditState, setIsEditState] = useState<boolean>(false);
	
	if (isEditState) {
		return <EditEndOfBoreholeBlockDetailsInputForm 
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
				<View style={{ flex: 1, minHeight: 20 }}></View>
			</View>
			<View style={{ flex: 1, gap: 20 }}>
				<Text>{block.description}</Text>
			</View>
		</Pressable>
	);
}