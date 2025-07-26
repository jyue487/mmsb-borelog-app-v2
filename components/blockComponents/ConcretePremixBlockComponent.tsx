import { Pressable, Text, View, type ViewProps } from "react-native";

import { ConcretePremixBlock } from '@/interfaces/ConcretePremixBlock';
import { DayWorkStatusComponent } from "../DayWorkStatusComponent";
import { useState } from "react";
import { BaseBlock, Block } from "@/interfaces/Block";
import { EditConcretePremixBlockDetailsInputForm } from "../blockDetailsInputForms/others/concretePremix/EditConcretePremixBlockDetailsInputForm";

export type ConcretePremixBlockProps = ViewProps & {
	block: BaseBlock & ConcretePremixBlock;
	blocks: Block[];
	setBlocks: React.Dispatch<React.SetStateAction<Block[]>>;
};

export function ConcretePremixBlockComponent({ style, block, blocks, setBlocks, ...otherProps }: ConcretePremixBlockProps) {
	const [isEditState, setIsEditState] = useState<boolean>(false);
	
	if (isEditState) {
		return <EditConcretePremixBlockDetailsInputForm 
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