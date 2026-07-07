import { Pressable, Text, View, type ViewProps } from "react-native";

import { styles } from "@/constants/styles";
import { AsphaltBlock } from '@/interfaces/AsphaltBlock';
import { BaseBlock, Block } from "@/interfaces/Block";
import { useState } from "react";
import { EditAsphaltBlockDetailsInputForm } from "../blockDetailsInputForms/others/asphalt/EditAsphaltBlockDetailsInputForm";
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