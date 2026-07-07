import { Pressable, Text, View, type ViewProps } from "react-native";

import { EditEndOfBoreholeBlockDetailsInputForm } from "@/components/blockDetailsInputForms/endOfBorehole/EditEndOfBoreholeBlockDetailsInputForm";
import { styles } from "@/constants/styles";
import { BaseBlock, Block } from "@/interfaces/Block";
import { EndOfBoreholeBlock } from '@/interfaces/EndOfBoreholeBlock';
import { useState } from "react";

export type EndOfBoreholeBlockProps = ViewProps & {
	block: BaseBlock & EndOfBoreholeBlock;
	blocks: Block[];
	setBlocks: React.Dispatch<React.SetStateAction<Block[]>>;
};

export function EndOfBoreholeBlockComponent({ block, blocks, setBlocks, ...otherProps }: EndOfBoreholeBlockProps) {
	return (
		<>
			<View style={styles.blockComponentLeftColumn}>
				<Text>{block.topDepthInMetres.toFixed(3)}</Text>
				<View style={{ flex: 1, minHeight: 20 }}></View>
			</View>
			<View style={{ flex: 1, gap: 20 }}>
				<Text>{block.description}</Text>
				{(block.remarks.length === 0) ? '' : <Text>Remarks: {block.remarks}.</Text>}
			</View>
		</>
	);
}