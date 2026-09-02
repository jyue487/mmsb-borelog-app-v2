import { Text, View, type ViewProps } from "react-native";

import { styles } from "@/src/constants/styles";
import { BaseBlock, Block, CustomBlock } from '@mmsb/core';
import { DayWorkStatusComponent } from "../dayWorkStatus/DayWorkStatusComponent";

export type CustomBlockProps = ViewProps & {
	block: BaseBlock & CustomBlock;
	blocks: Block[];
	setBlocks: React.Dispatch<React.SetStateAction<Block[]>>;
};

export function CustomBlockComponent({ block, blocks, setBlocks, ...otherProps }: CustomBlockProps) {
	return (
		<>
			<View style={styles.blockComponentLeftColumn}>
				<Text>{(block.topDepthInMetres === -1) ? null : block.topDepthInMetres.toFixed(3)}</Text>
				<View style={{ flex: 1, minHeight: 20 }}></View>
				<Text>{(block.baseDepthInMetres === -1) ? null : block.baseDepthInMetres.toFixed(3)}</Text>
			</View>
			<View style={{ flex: 1, gap: 20 }}>
				<DayWorkStatusComponent dayWorkStatus={block.dayWorkStatus}/>
				<Text>{block.description}</Text>
			</View>
		</>
	);
}