import { Pressable, Text, View, type ViewProps } from "react-native";

import { CustomBlock } from '@/interfaces/CustomBlock';
import { DayWorkStatusComponent } from "../DayWorkStatusComponent";
import { useState } from "react";
import { BaseBlock, Block } from "@/interfaces/Block";
import { EditCustomBlockDetailsInputForm } from "../blockDetailsInputForms/others/custom/EditCustomBlockDetailsInputForm";

export type CustomBlockProps = ViewProps & {
	block: BaseBlock & CustomBlock;
	blocks: Block[];
	setBlocks: React.Dispatch<React.SetStateAction<Block[]>>;
};

export function CustomBlockComponent({ style, block, blocks, setBlocks, ...otherProps }: CustomBlockProps) {
	const [isEditState, setIsEditState] = useState<boolean>(false);
	
	if (isEditState) {
		return <EditCustomBlockDetailsInputForm 
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
				style,
			]} 
			{...otherProps}>
			<View style={{ backgroundColor: 'red', height: '100%', width: 70, paddingHorizontal: 1, alignItems: 'center'}}>
				<Text>{(block.topDepthInMetres === -1) ? null : block.topDepthInMetres.toFixed(3)}</Text>
				<View style={{ flex: 1, minHeight: 20 }}></View>
				<Text>{(block.baseDepthInMetres === -1) ? null : block.baseDepthInMetres.toFixed(3)}</Text>
			</View>
			<View style={{ flex: 1, gap: 20 }}>
				<DayWorkStatusComponent dayWorkStatus={block.dayWorkStatus}/>
				<Text>{block.description}</Text>
			</View>
		</Pressable>
	);
}