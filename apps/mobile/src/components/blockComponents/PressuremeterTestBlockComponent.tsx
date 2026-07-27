import { Text, View, type ViewProps } from "react-native";

import { styles } from "@/src/constants/styles";
import { PRESSUREMETER_TEST_SYMBOL } from "@/src/constants/symbol";
import { BaseBlock, Block } from "@/src/interfaces/Block";
import { PressuremeterTestBlock } from '@/src/interfaces/PressuremeterTestBlock';
import { DayWorkStatusComponent } from "../dayWorkStatus/DayWorkStatusComponent";

export type PressuremeterTestBlockProps = ViewProps & {
	block: BaseBlock & PressuremeterTestBlock;
	blocks: Block[];
	setBlocks: React.Dispatch<React.SetStateAction<Block[]>>;
};

export function PressuremeterTestBlockComponent({ block, blocks, setBlocks, ...otherProps }: PressuremeterTestBlockProps) {
	return (
		<>
			<View style={styles.blockComponentLeftColumn}>
				<Text>{block.topDepthInMetres.toFixed(3)}</Text>
				<View style={{ flex: 1 }}></View>
				<Text>{PRESSUREMETER_TEST_SYMBOL}{block.pressuremeterTestIndex}</Text>
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