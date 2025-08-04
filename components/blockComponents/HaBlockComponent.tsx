import { Pressable, Text, View, type ViewProps } from "react-native";

import { HA_SYMBOL } from "@/constants/symbol";
import { HaBlock } from '@/interfaces/HaBlock';
import { DayWorkStatusComponent } from "../DayWorkStatusComponent";
import { BaseBlock, Block } from "@/interfaces/Block";
import { useState } from "react";
import { EditHaBlockDetailsInputForm } from "../blockDetailsInputForms/others/ha/EditHaBlockDetailsInputForm";
import { styles } from "@/constants/styles";

export type HaBlockProps = ViewProps & {
	block: BaseBlock & HaBlock;
	blocks: Block[];
	setBlocks: React.Dispatch<React.SetStateAction<Block[]>>;
};

export function HaBlockComponent({ block, blocks, setBlocks, ...otherProps }: HaBlockProps) {
	const [isEditState, setIsEditState] = useState<boolean>(false);
	
	if (isEditState) {
		return <EditHaBlockDetailsInputForm 
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
				<Text>{HA_SYMBOL}{block.haSampleIndex}</Text>
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