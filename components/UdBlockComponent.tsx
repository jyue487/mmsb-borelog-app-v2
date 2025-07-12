import { Text, View, type ViewProps } from "react-native";

import { UdBlock } from '@/types/UdBlock';

export type UdBlockProps = ViewProps & {
	udBlock: UdBlock
};

export function UdBlockComponent({ style, udBlock, ...otherProps }: UdBlockProps) {
	return (
		<View style={[{ flexDirection: 'row'}, style]} {...otherProps}>
			<View style={{ backgroundColor: 'red', height: '100%', width: 70, paddingHorizontal: 1, alignItems: 'center'}}>
				<Text>{udBlock.topDepthInMetres.toFixed(3)}</Text>
				<View style={{ flex: 1 }}></View>
				<Text>UD{udBlock.undisturbedSampleIndex}</Text>
				<View style={{ flex: 1 }}></View>
				<Text>{udBlock.baseDepthInMetres.toFixed(3)}</Text>
			</View>
			<View style={{ flex: 1 }}>
				<Text>Top: {udBlock.topSoilDescription}</Text>
				<Text>Base: {udBlock.baseSoilDescription}</Text>
				<Text>R%: {(udBlock.recoveryLengthInMetres / (udBlock.baseDepthInMetres - udBlock.topDepthInMetres) * 100).toFixed(0)}</Text>
			</View>
		</View>
	);
}