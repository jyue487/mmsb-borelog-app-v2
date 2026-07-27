import { Text, View, type ViewProps } from "react-native";

import { styles } from "@/src/constants/styles";
import { BaseBlock, Block } from "@/src/interfaces/Block";
import { CavityBlock } from '@/src/interfaces/CavityBlock';
import { DayWorkStatusComponent } from "../dayWorkStatus/DayWorkStatusComponent";

export type CavityBlockProps = ViewProps & {
	block: BaseBlock & CavityBlock;
	blocks: Block[];
	setBlocks: React.Dispatch<React.SetStateAction<Block[]>>;
};

export function CavityBlockComponent({ block, blocks, setBlocks, ...otherProps }: CavityBlockProps) {
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