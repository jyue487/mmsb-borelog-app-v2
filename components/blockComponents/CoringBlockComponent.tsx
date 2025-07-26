import { Pressable, Text, View, type ViewProps } from "react-native";

import { CORING_SYMBOL } from "@/constants/symbol";
import { CoringBlock } from '@/interfaces/CoringBlock';
import { DayWorkStatusComponent } from "../DayWorkStatusComponent";
import { BaseBlock, Block } from "@/interfaces/Block";
import { useState } from "react";
import { EditCoringBlockDetailsInputForm } from "../blockDetailsInputForms/coring&cavity/coring/EditCoringBlockDetailsInputForm";

export type CoringBlockProps = ViewProps & {
	block: BaseBlock & CoringBlock;
	blocks: Block[];
	setBlocks: React.Dispatch<React.SetStateAction<Block[]>>;
};

export function CoringBlockComponent({ style, block, blocks, setBlocks, ...otherProps }: CoringBlockProps) {
	const [isEditState, setIsEditState] = useState<boolean>(false);
	
	if (isEditState) {
		return <EditCoringBlockDetailsInputForm 
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
				<View style={{ flex: 1 }}></View>
				<Text>{CORING_SYMBOL}{(block.coreRecoveryInPercentage === 0) ? '*' : block.rockSampleIndex}</Text>
				<View style={{ flex: 1 }}></View>
				<Text>{block.baseDepthInMetres.toFixed(3)}</Text>
			</View>
			<View style={{ flex: 1, gap: 20 }}>
				<DayWorkStatusComponent dayWorkStatus={block.dayWorkStatus}/>
				<Text>{block.rockDescription}</Text>
				<View style={{ flexDirection: 'row' }}>
					<View style={{ flex: 4, borderRightWidth: 0.25, alignItems: 'center' }}>
						<Text>Core Run(m)</Text>
						<Text>{block.coreRunInMetres.toFixed(2)}</Text>
					</View>
					<View style={{ flex: 3, borderLeftWidth: 0.25, borderRightWidth: 0.25, alignItems: 'center' }}>
						<Text>C.R.%</Text>
						<Text>{block.coreRecoveryInPercentage}</Text>
					</View>
					<View style={{ flex: 3, borderLeftWidth: 0.25, alignItems: 'center' }}>
						<Text>R.Q.D%</Text>
						<Text>{block.rqdInPercentage}</Text>
					</View>
				</View>
			</View>
		</Pressable>
	);
}