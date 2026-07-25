import { Pressable, Text, View, type ViewProps } from "react-native";

import { styles } from "@/constants/styles";
import { VANE_SHEAR_TEST_SYMBOL } from "@/constants/symbol";
import { BaseBlock, Block } from "@/interfaces/Block";
import { VaneShearTestBlock } from '@/interfaces/VaneShearTestBlock';
import { DayWorkStatusComponent } from "../dayWorkStatus/DayWorkStatusComponent";

export type VaneShearTestBlockProps = ViewProps & {
	block: BaseBlock & VaneShearTestBlock;
	blocks: Block[];
	setBlocks: React.Dispatch<React.SetStateAction<Block[]>>;
};

export function VaneShearTestBlockComponent({ block, blocks, setBlocks, ...otherProps }: VaneShearTestBlockProps) {
	return (
		<>
			<View style={styles.blockComponentLeftColumn}>
				<Text>{block.topDepthInMetres.toFixed(3)}</Text>
				<View style={{ flex: 1 }}></View>
				<Text>{VANE_SHEAR_TEST_SYMBOL}{block.vaneShearTestIndex}</Text>
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