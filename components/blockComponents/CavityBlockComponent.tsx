import { Pressable, Text, View, type ViewProps } from "react-native";

import { BaseBlock, Block } from "@/interfaces/Block";
import { CavityBlock } from '@/interfaces/CavityBlock';
import { useState } from "react";
import { EditCavityBlockDetailsInputForm } from "../blockDetailsInputForms/coring&cavity/cavity/EditCavityBlockDetailsInputForm";
import { DayWorkStatusComponent } from "../DayWorkStatusComponent";

export type CavityBlockProps = ViewProps & {
	block: BaseBlock & CavityBlock;
	blocks: Block[];
	setBlocks: React.Dispatch<React.SetStateAction<Block[]>>;
};

export function CavityBlockComponent({ style, block, blocks, setBlocks, ...otherProps }: CavityBlockProps) {
	const [isEditState, setIsEditState] = useState<boolean>(false);
	
	if (isEditState) {
		return <EditCavityBlockDetailsInputForm 
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