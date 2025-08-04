import { Pressable, Text, View, type ViewProps } from "react-native";

import { WashBoringBlock } from '@/interfaces/WashBoringBlock';
import { DayWorkStatusComponent } from "../DayWorkStatusComponent";
import { BaseBlock, Block } from "@/interfaces/Block";
import { useState } from "react";
import { EditWashBoringBlockDetailsInputForm } from "../blockDetailsInputForms/others/washBoring/EditWashBoringBlockDetailsInputForm";
import { styles } from "@/constants/styles";

export type WashBoringBlockProps = ViewProps & {
	block: BaseBlock & WashBoringBlock;
	blocks: Block[];
	setBlocks: React.Dispatch<React.SetStateAction<Block[]>>;
};

export function WashBoringBlockComponent({ block, blocks, setBlocks, ...otherProps }: WashBoringBlockProps) {
	const [isEditState, setIsEditState] = useState<boolean>(false);
	
	if (isEditState) {
		return <EditWashBoringBlockDetailsInputForm 
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
				<Text>{block.baseDepthInMetres.toFixed(3)}</Text>
			</View>
			<View style={{ flex: 1, gap: 20 }}>
				<DayWorkStatusComponent dayWorkStatus={block.dayWorkStatus}/>
				<Text>{block.description}</Text>
			</View>
		</Pressable>
	);
}