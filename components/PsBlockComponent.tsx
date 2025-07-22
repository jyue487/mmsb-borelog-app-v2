import { Text, View, type ViewProps } from "react-native";

import { PsBlock } from '@/types/PsBlock';

export type PsBlockProps = ViewProps & {
	psBlock: PsBlock
};

export function PsBlockComponent({ style, psBlock, ...otherProps }: PsBlockProps) {
	return (
		<View style={[{ flexDirection: 'row'}, style]} {...otherProps}>
			<View style={{ backgroundColor: 'red', height: '100%', width: 70, paddingHorizontal: 1, alignItems: 'center'}}>
				<Text>{psBlock.topDepthInMetres.toFixed(3)}</Text>
				<View style={{ flex: 1 }}></View>
				<Text>PS{(psBlock.recoveryLengthInMetres === 0) ? '*' : psBlock.pistonSampleIndex}</Text>
				<View style={{ flex: 1 }}></View>
				<Text>{psBlock.baseDepthInMetres.toFixed(3)}</Text>
			</View>
			<View style={{ flex: 1, flexDirection: 'row' }}>
				<View style={{ flex: 7, borderRightWidth: 0.25 }}>
					<Text>Top: {psBlock.topSoilDescription}</Text>
					<Text></Text>
					<Text>Bottom: {psBlock.baseSoilDescription}</Text>
				</View>
				<View style={{ flex: 1, borderLeftWidth: 0.25, alignItems: 'center' }}>
					<Text>R%</Text>
					<Text>{(psBlock.recoveryLengthInMetres / (psBlock.baseDepthInMetres - psBlock.topDepthInMetres) * 100).toFixed(0)}</Text>
				</View>
			</View>
		</View>
	);
}