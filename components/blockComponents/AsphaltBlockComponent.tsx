import { Pressable, Text, View, type ViewProps } from "react-native";

import { styles } from "@/constants/styles";
import { AsphaltBlock } from '@/interfaces/AsphaltBlock';
import { BaseBlock, Block } from "@/interfaces/Block";
import { useState } from "react";
import { EditAsphaltBlockDetailsInputForm } from "../blockDetailsInputForms/others/asphalt/EditAsphaltBlockDetailsInputForm";
import { DayWorkStatusComponent } from "../dayWorkStatus/DayWorkStatusComponent";

export type AsphaltBlockProps = ViewProps & {
	block: BaseBlock & AsphaltBlock;
	blocks: Block[];
	setBlocks: React.Dispatch<React.SetStateAction<Block[]>>;
};

export function AsphaltBlockComponent({ block, blocks, setBlocks, ...otherProps }: AsphaltBlockProps) {
	const [isEditState, setIsEditState] = useState<boolean>(false);
	
	if (isEditState) {
		return <EditAsphaltBlockDetailsInputForm 
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