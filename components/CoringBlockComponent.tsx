import { Text, View, type ViewProps } from "react-native";

import { CoringBlock } from '@/types/CoringBlock';

export type CoringBlockProps = ViewProps & {
	coringBlock: CoringBlock
};

export function CoringBlockComponent({ style, coringBlock, ...otherProps }: CoringBlockProps) {
	return (
		<View style={[{ flexDirection: 'row'}, style]} {...otherProps}>
			<View style={{ backgroundColor: 'red', height: '100%', width: 70, paddingHorizontal: 1, alignItems: 'center'}}>
				<Text>{coringBlock.topDepthInMetres.toFixed(3)}</Text>
				<View style={{ flex: 1 }}></View>
				<Text>C{(coringBlock.coreRecoveryInPercentage === 0) ? '*' : coringBlock.rockSampleIndex}</Text>
				<View style={{ flex: 1 }}></View>
				<Text>{coringBlock.baseDepthInMetres.toFixed(3)}</Text>
			</View>
			<View style={{ flex: 1 }}>
				<Text>{coringBlock.rockDescription}</Text>
				<Text></Text>
				<View style={{ flexDirection: 'row' }}>
					<View style={{ flex: 4, borderRightWidth: 0.25, alignItems: 'center' }}>
						<Text>Core Run(m)</Text>
						<Text>{coringBlock.coreRunInMetres.toFixed(2)}</Text>
					</View>
					<View style={{ flex: 3, borderLeftWidth: 0.25, borderRightWidth: 0.25, alignItems: 'center' }}>
						<Text>C.R.%</Text>
						<Text>{coringBlock.coreRecoveryInPercentage}</Text>
					</View>
					<View style={{ flex: 3, borderLeftWidth: 0.25, alignItems: 'center' }}>
						<Text>R.Q.D%</Text>
						<Text>{coringBlock.rqdInPercentage}</Text>
					</View>
				</View>
			</View>
		</View>
	);
}