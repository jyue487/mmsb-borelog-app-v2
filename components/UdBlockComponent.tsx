import { Text, View, type ViewProps } from "react-native";

import { UdBlock } from '@/interfaces/UdBlock';

export type UdBlockProps = ViewProps & {
	udBlock: UdBlock
};

export function UdBlockComponent({ style, udBlock, ...otherProps }: UdBlockProps) {
	return (
		<View style={[{ flexDirection: 'row'}, style]} {...otherProps}>
			<View style={{ backgroundColor: 'red', height: '100%', width: 70, paddingHorizontal: 1, alignItems: 'center'}}>
				<Text>{udBlock.topDepthInMetres.toFixed(3)}</Text>
				<View style={{ flex: 1 }}></View>
				<Text>UD{(udBlock.recoveryLengthInMetres === 0) ? '*' : udBlock.undisturbedSampleIndex}</Text>
				<View style={{ flex: 1 }}></View>
				<Text>{udBlock.baseDepthInMetres.toFixed(3)}</Text>
			</View>
			<View style={{ flex: 1, flexDirection: 'row' }}>
				<View style={{ flex: 7, borderRightWidth: 0.25 }}>
					<Text>Top: {udBlock.topSoilDescription}</Text>
					<Text></Text>
					<Text>Bottom: {udBlock.baseSoilDescription}</Text>
				</View>
				<View style={{ flex: 1, borderLeftWidth: 0.25, alignItems: 'center' }}>
					<Text>R%</Text>
					<Text>{(udBlock.recoveryLengthInMetres / (udBlock.baseDepthInMetres - udBlock.topDepthInMetres) * 100).toFixed(0)}</Text>
				</View>
			</View>
		</View>
	);
}