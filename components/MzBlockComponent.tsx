import { Text, View, type ViewProps } from "react-native";

import { MzBlock } from '@/types/MzBlock';

export type MzBlockProps = ViewProps & {
	mzBlock: MzBlock
};

export function MzBlockComponent({ style, mzBlock, ...otherProps }: MzBlockProps) {
	return (
		<View style={[{ flexDirection: 'row'}, style]} {...otherProps}>
			<View style={{ backgroundColor: 'red', height: '100%', width: 70, paddingHorizontal: 1, alignItems: 'center'}}>
				<Text>{mzBlock.topDepthInMetres.toFixed(3)}</Text>
				<View style={{ flex: 1 }}></View>
				<Text>MZ{(mzBlock.recoveryLengthInMetres === 0) ? '*' : mzBlock.mazierSampleIndex}</Text>
				<View style={{ flex: 1 }}></View>
				<Text>{mzBlock.baseDepthInMetres.toFixed(3)}</Text>
			</View>
			<View style={{ flex: 1, flexDirection: 'row' }}>
				<View style={{ flex: 7, borderRightWidth: 0.25 }}>
					<Text>Top: {mzBlock.topSoilDescription}</Text>
					<Text></Text>
					<Text>Bottom: {mzBlock.baseSoilDescription}</Text>
				</View>
				<View style={{ flex: 1, borderLeftWidth: 0.25, alignItems: 'center' }}>
					<Text>R%</Text>
					<Text>{(mzBlock.recoveryLengthInMetres / (mzBlock.baseDepthInMetres - mzBlock.topDepthInMetres) * 100).toFixed(0)}</Text>
				</View>
			</View>
		</View>
	);
}