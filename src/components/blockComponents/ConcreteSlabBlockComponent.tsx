import { Text, View, type ViewProps } from "react-native";

import { styles } from "@/src/constants/styles";
import { BaseBlock, Block } from "@/src/interfaces/Block";
import { ConcreteSlabBlock } from '@/src/interfaces/ConcreteSlabBlock';
import { DayWorkStatusComponent } from "../dayWorkStatus/DayWorkStatusComponent";

export type ConcreteSlabBlockProps = ViewProps & {
	block: BaseBlock & ConcreteSlabBlock;
	blocks: Block[];
	setBlocks: React.Dispatch<React.SetStateAction<Block[]>>;
};

export function ConcreteSlabBlockComponent({ block, blocks, setBlocks, ...otherProps }: ConcreteSlabBlockProps) {
	return (
		<>
			<View style={styles.blockComponentLeftColumn}>
				<Text>{block.topDepthInMetres.toFixed(3)}</Text>
				<View style={{ flex: 1, minHeight: 20 }}></View>
				<Text>{block.baseDepthInMetres.toFixed(3)}</Text>
			</View>
			<View style={{ flex: 1, gap: 20 }}>
				<DayWorkStatusComponent dayWorkStatus={block.dayWorkStatus}/>
				<Text>{block.description}</Text>
			</View>
		</>
	);
}