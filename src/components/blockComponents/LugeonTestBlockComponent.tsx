import { Text, View, type ViewProps } from "react-native";

import { styles } from "@/src/constants/styles";
import { LUGEON_TEST_SYMBOL } from "@/src/constants/symbol";
import { BaseBlock, Block } from "@/src/interfaces/Block";
import { LugeonTestBlock } from '@/src/interfaces/LugeonTestBlock';
import { DayWorkStatusComponent } from "../dayWorkStatus/DayWorkStatusComponent";

export type LugeonTestBlockProps = ViewProps & {
	block: BaseBlock & LugeonTestBlock;
	blocks: Block[];
	setBlocks: React.Dispatch<React.SetStateAction<Block[]>>;
};

export function LugeonTestBlockComponent({ block, blocks, setBlocks, ...otherProps }: LugeonTestBlockProps) {
	return (
		<>
			<View style={styles.blockComponentLeftColumn}>
				<Text>{block.topDepthInMetres.toFixed(3)}</Text>
				<View style={{ flex: 1 }}></View>
				<Text>{LUGEON_TEST_SYMBOL}{block.lugeonTestIndex}</Text>
				<View style={{ flex: 1 }}></View>
				<Text>{block.baseDepthInMetres.toFixed(3)}</Text>
			</View>
			<View style={{ flex: 1, gap: 20 }}>
				<DayWorkStatusComponent dayWorkStatus={block.dayWorkStatus}/>
				<Text>{block.description}</Text>
			</View>
		</>
	);
}