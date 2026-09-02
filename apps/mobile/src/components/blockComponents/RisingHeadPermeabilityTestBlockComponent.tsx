import { Text, View, type ViewProps } from "react-native";

import { styles } from "@/src/constants/styles";
import {
	BaseBlock,
	Block,
	RISING_HEAD_PERMEABILITY_TEST_SYMBOL,
	RisingHeadPermeabilityTestBlock,
} from '@mmsb/core';
import { DayWorkStatusComponent } from "../dayWorkStatus/DayWorkStatusComponent";

export type RisingHeadPermeabilityTestBlockProps = ViewProps & {
	block: BaseBlock & RisingHeadPermeabilityTestBlock;
	blocks: Block[];
	setBlocks: React.Dispatch<React.SetStateAction<Block[]>>;
};

export function RisingHeadPermeabilityTestBlockComponent({ block, blocks, setBlocks, ...otherProps }: RisingHeadPermeabilityTestBlockProps) {
	return (
		<>
			<View style={styles.blockComponentLeftColumn}>
				<Text>{block.topDepthInMetres.toFixed(3)}</Text>
				<View style={{ flex: 1 }}></View>
				<Text>{RISING_HEAD_PERMEABILITY_TEST_SYMBOL}{block.permeabilityTestIndex}</Text>
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