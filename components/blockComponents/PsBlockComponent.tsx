import { Pressable, Text, View, type ViewProps } from "react-native";

import { styles } from "@/constants/styles";
import { PS_SYMBOL } from "@/constants/symbol";
import { BaseBlock, Block } from "@/interfaces/Block";
import { PsBlock } from '@/interfaces/PsBlock';
import { useState } from "react";
import { EditPsBlockDetailsInputForm } from "../blockDetailsInputForms/undisturbedSample/ps/EditPsBlockDetailsInputForm";
import { DayWorkStatusComponent } from "../dayWorkStatus/DayWorkStatusComponent";

export type PsBlockProps = ViewProps & {
	block: BaseBlock & PsBlock;
	blocks: Block[];
	setBlocks: React.Dispatch<React.SetStateAction<Block[]>>;
};

export function PsBlockComponent({ block, blocks, setBlocks, ...otherProps }: PsBlockProps) {
	const [isEditState, setIsEditState] = useState<boolean>(false);
	
	if (isEditState) {
		return <EditPsBlockDetailsInputForm 
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
				<Text>{PS_SYMBOL}{(block.recoveryInPercentage === 0) ? '*' : block.sampleIndex}</Text>
				<View style={{ flex: 1 }}></View>
				<Text>{block.baseDepthInMetres.toFixed(3)}</Text>
			</View>
			<View style={{ flex: 1, gap: 20  }}>
				<DayWorkStatusComponent dayWorkStatus={block.dayWorkStatus}/>
				<View style={{ flexDirection: 'row' }}>
					<View style={{ flex: 4, borderRightWidth: 0.25 }}>
						<Text>{block.soilDescription}</Text>
					</View>
					<View style={{ flex: 1, borderLeftWidth: 0.25, alignItems: 'center' }}>
						<Text>R%</Text>
						<Text>{(block.recoveryInPercentage).toFixed(1)}</Text>
					</View>
				</View>
			</View>
		</Pressable>
	);
}