import { Text, View, type ViewProps } from "react-native";

import { styles } from "@/src/constants/styles";
import { PS_SYMBOL } from "@/src/constants/symbol";
import { BaseBlock, Block } from "@/src/interfaces/Block";
import { PsBlock } from '@/src/interfaces/PsBlock';
import { DayWorkStatusComponent } from "../dayWorkStatus/DayWorkStatusComponent";

export type PsBlockProps = ViewProps & {
	block: BaseBlock & PsBlock;
	blocks: Block[];
	setBlocks: React.Dispatch<React.SetStateAction<Block[]>>;
};

export function PsBlockComponent({ block, blocks, setBlocks, ...otherProps }: PsBlockProps) {
	return (
		<>
			<View style={styles.blockComponentLeftColumn}>
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
		</>
	);
}