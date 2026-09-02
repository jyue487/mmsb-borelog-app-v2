import { Text, View, type ViewProps } from "react-native";

import { styles } from "@/src/constants/styles";
import { AsphaltBlock, BaseBlock, Block } from '@mmsb/core';
import { DayWorkStatusComponent } from "../dayWorkStatus/DayWorkStatusComponent";

export type AsphaltBlockProps = ViewProps & {
	block: BaseBlock & AsphaltBlock;
	blocks: Block[];
	setBlocks: React.Dispatch<React.SetStateAction<Block[]>>;
};

export function AsphaltBlockComponent({ block, blocks, setBlocks, ...otherProps }: AsphaltBlockProps) {
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