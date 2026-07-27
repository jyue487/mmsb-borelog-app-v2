import { Text, View, type ViewProps } from "react-native";

import { DayWorkStatusComponent } from "@/src/components/dayWorkStatus/DayWorkStatusComponent";
import { styles } from "@/src/constants/styles";
import { DISTURBED_SAMPLE_SYMBOL, SPT_SYMBOL } from "@/src/constants/symbol";
import { BaseBlock, Block } from "@/src/interfaces/Block";
import { SptBlock } from '@/src/interfaces/SptBlock';

export type SptBlockProps = ViewProps & {
	block: BaseBlock & SptBlock;
	blocks: Block[];
	setBlocks: React.Dispatch<React.SetStateAction<Block[]>>;
};

export function SptBlockComponent({ block, blocks, setBlocks, ...otherProps }: SptBlockProps) {
	return (
		<>
			<View style={styles.blockComponentLeftColumn}>
				<Text>{block.topDepthInMetres.toFixed(3)}</Text>
				<View style={{ flex: 1 }}></View>
				<Text>{SPT_SYMBOL}{block.sptIndex}</Text>
				<Text>{DISTURBED_SAMPLE_SYMBOL}{(block.recoveryInPercentage === 0) ? '*' : block.disturbedSampleIndex}</Text>
				<View style={{ flex: 1 }}></View>
				<Text>{block.baseDepthInMetres.toFixed(3)}</Text>
			</View>
			<View style={{ flex: 1, gap: 20 }}>
				<DayWorkStatusComponent dayWorkStatus={block.dayWorkStatus}/>
				<Text>{block.description}</Text>
				<View style={{ flexDirection: 'row' }}>
					<View style={{ flex: 2, borderRightWidth: 0.5, alignItems: 'center' }}>
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
					<View style={{ flex: 4, borderLeftWidth: 0.5, borderRightWidth: 0.5, alignItems: 'center' }}>
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
					<View style={{ flex: 1, borderLeftWidth: 0.5, borderRightWidth: 0.5, alignItems: 'center' }}>
						<Text>N</Text>
						<Text>{block.sptNValue}</Text>
						<Text>{block.sptNValue === 50 ? (block.totalMainPenetrationInMillimetres) : null}
						</Text>
					</View>
					<View style={{ flex: 1.5, borderLeftWidth: 0.5, alignItems: 'center' }}>
						<Text>R%</Text>
						<Text>{block.recoveryInPercentage.toFixed(1)}</Text>
					</View>
				</View>
			</View>
		</>
	);
}