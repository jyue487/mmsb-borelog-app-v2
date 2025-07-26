import { Pressable, Text, View, type ViewProps } from "react-native";

import { DayWorkStatusComponent } from "@/components/DayWorkStatusComponent";
import { DISTURBED_SAMPLE_SYMBOL, SPT_SYMBOL } from "@/constants/symbol";
import { BaseBlock, Block } from "@/interfaces/Block";
import { SptBlock } from '@/interfaces/SptBlock';
import { useState } from "react";
import { EditSptBlockDetailsInputForm } from "../blockDetailsInputForms/spt/EditSptBlockDetailsInputForm";

export type SptBlockProps = ViewProps & {
	block: BaseBlock & SptBlock;
	blocks: Block[];
	setBlocks: React.Dispatch<React.SetStateAction<Block[]>>;
};

export function SptBlockComponent({ style, block, blocks, setBlocks, ...otherProps }: SptBlockProps) {
	const [isEditState, setIsEditState] = useState<boolean>(false);

	if (isEditState) {
		return <EditSptBlockDetailsInputForm 
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
				<Text>{SPT_SYMBOL}{block.sptIndex}</Text>
				<Text>{DISTURBED_SAMPLE_SYMBOL}{(block.recoveryInPercentage === 0) ? '*' : block.disturbedSampleIndex}</Text>
				<View style={{ flex: 1 }}></View>
				<Text>{block.baseDepthInMetres.toFixed(3)}</Text>
			</View>
			<View style={{ flex: 1, gap: 20 }}>
				<DayWorkStatusComponent dayWorkStatus={block.dayWorkStatus}/>
				<Text>{block.soilDescription}</Text>
				<View style={{ flexDirection: 'row' }}>
					<View style={{ flex: 2, borderRightWidth: 0.25, alignItems: 'center' }}>
						<Text>Seating</Text>
						<View style={{ flexDirection: 'row'}}>
							<View style={{ flex: 1, alignItems: 'center'}}>
								<Text>{block.seatingIncBlows1}</Text>
								<Text>{block.seatingIncPen1}</Text>
							</View>
							<View style={{ flex: 1, alignItems: 'center' }}>
								<Text>{block.seatingIncBlows2}</Text>
								<Text>{block.seatingIncPen2}</Text>
							</View>
						</View>
					</View>
					<View style={{ flex: 4, borderLeftWidth: 0.25, borderRightWidth: 0.25, alignItems: 'center' }}>
						<Text>Test Drive</Text>
						<View style={{ flexDirection: 'row' }}>
							<View style={{ flex: 1, alignItems: 'center' }}>
								<Text>{block.mainIncBlows1}</Text>
								<Text>{block.mainIncPen1}</Text>
							</View>
							<View style={{ flex: 1, alignItems: 'center' }}>
								<Text>{block.mainIncBlows1 < 50 ? block.mainIncBlows2 : null}</Text>
								<Text>{block.mainIncBlows1 < 50 ? block.mainIncPen2 : null}</Text>
							</View>
							<View style={{ flex: 1, alignItems: 'center' }}>
								<Text>{block.mainIncBlows3}</Text>
								<Text>{block.mainIncPen3}</Text>
							</View>
							<View style={{ flex: 1, alignItems: 'center' }}>
								<Text>{block.mainIncBlows4}</Text>
								<Text>{block.mainIncPen4}</Text>
							</View>
						</View>
					</View>
					<View style={{ flex: 1, borderLeftWidth: 0.25, borderRightWidth: 0.25, alignItems: 'center' }}>
						<Text>N</Text>
						<Text>{block.sptNValue}</Text>
						<Text>{block.sptNValue === 50 ? (block.totalMainPenetrationInMillimetres) : null}
						</Text>
					</View>
					<View style={{ flex: 1, borderLeftWidth: 0.25, alignItems: 'center' }}>
						<Text>R%</Text>
						<Text>{block.recoveryInPercentage.toFixed(1)}</Text>
					</View>
				</View>
			</View>
		</Pressable>
	);
}