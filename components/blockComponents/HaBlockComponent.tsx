import { Pressable, Text, View, type ViewProps } from "react-native";

import { styles } from "@/constants/styles";
import { HA_SYMBOL } from "@/constants/symbol";
import { BaseBlock, Block } from "@/interfaces/Block";
import { HaBlock } from '@/interfaces/HaBlock';
import { DayWorkStatusComponent } from "../dayWorkStatus/DayWorkStatusComponent";

export type HaBlockProps = ViewProps & {
	block: BaseBlock & HaBlock;
	blocks: Block[];
	setBlocks: React.Dispatch<React.SetStateAction<Block[]>>;
};

export function HaBlockComponent({ block, blocks, setBlocks, ...otherProps }: HaBlockProps) {
	return (
		<>
			<View style={styles.blockComponentLeftColumn}>
				<Text>{block.topDepthInMetres.toFixed(3)}</Text>
				<View style={{ flex: 1 }}></View>
				<Text>{HA_SYMBOL}{block.haSampleIndex}</Text>
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