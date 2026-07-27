import { Text, View, type ViewProps } from "react-native";

import { styles } from "@/src/constants/styles";
import { CONSTANT_HEAD_PERMEABILITY_TEST_SYMBOL } from "@/src/constants/symbol";
import { BaseBlock, Block } from "@/src/interfaces/Block";
import { ConstantHeadPermeabilityTestBlock } from '@/src/interfaces/ConstantHeadPermeabilityTestBlock';
import { DayWorkStatusComponent } from "../dayWorkStatus/DayWorkStatusComponent";

export type ConstantHeadPermeabilityTestBlockProps = ViewProps & {
	block: BaseBlock & ConstantHeadPermeabilityTestBlock;
	blocks: Block[];
	setBlocks: React.Dispatch<React.SetStateAction<Block[]>>;
};

export function ConstantHeadPermeabilityTestBlockComponent({ block, blocks, setBlocks, ...otherProps }: ConstantHeadPermeabilityTestBlockProps) {
	return (
		<>
			<View style={styles.blockComponentLeftColumn}>
				<Text>{block.topDepthInMetres.toFixed(3)}</Text>
				<View style={{ flex: 1 }}></View>
				<Text>{CONSTANT_HEAD_PERMEABILITY_TEST_SYMBOL}{block.permeabilityTestIndex}</Text>
				<View style={{ flex: 1 }}></View>
				<Text>{(block.topDepthInMetres === block.baseDepthInMetres) ? '' : block.baseDepthInMetres.toFixed(3)}</Text>
			</View>
			<View style={{ flex: 1, gap: 20 }}>
				<DayWorkStatusComponent dayWorkStatus={block.dayWorkStatus}/>
				<Text>{block.description}</Text>
			</View>
		</>
	);
}