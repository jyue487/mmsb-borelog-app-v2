import { Pressable, Text, View, type ViewProps } from "react-native";

import { UD_SYMBOL } from "@/constants/symbol";
import { UdBlock } from '@/interfaces/UdBlock';
import { DayWorkStatusComponent } from "../DayWorkStatusComponent";
import { BaseBlock, Block } from "@/interfaces/Block";
import { useState } from "react";
import { EditUdBlockDetailsInputForm } from "../blockDetailsInputForms/undisturbedSample/ud/EditUdBlockDetailsInputForm";

export type UdBlockProps = ViewProps & {
	block: BaseBlock & UdBlock;
	blocks: Block[];
	setBlocks: React.Dispatch<React.SetStateAction<Block[]>>;
};

export function UdBlockComponent({ style, block, blocks, setBlocks, ...otherProps }: UdBlockProps) {
	const [isEditState, setIsEditState] = useState<boolean>(false);
	
	if (isEditState) {
		return <EditUdBlockDetailsInputForm 
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
				<Text>{UD_SYMBOL}{(block.recoveryInPercentage === 0) ? '*' : block.undisturbedSampleIndex}</Text>
				<View style={{ flex: 1 }}></View>
				<Text>{block.baseDepthInMetres.toFixed(3)}</Text>
			</View>
			<View style={{ flex: 1, gap: 20  }}>
				<DayWorkStatusComponent dayWorkStatus={block.dayWorkStatus}/>
				<View style={{ flex: 1, flexDirection: 'row' }}>
					<View style={{ flex: 7, borderRightWidth: 0.25 }}>
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