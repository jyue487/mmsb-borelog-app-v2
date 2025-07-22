import { Text, View, type ViewProps } from "react-native";

import { CavityBlock } from '@/types/CavityBlock';

export type CavityBlockProps = ViewProps & {
	cavityBlock: CavityBlock
};

export function CavityBlockComponent({ style, cavityBlock, ...otherProps }: CavityBlockProps) {
	return (
		<View style={[{ flexDirection: 'row'}, style]} {...otherProps}>
			<View style={{ backgroundColor: 'red', height: '100%', width: 70, paddingHorizontal: 1, alignItems: 'center'}}>
				<Text>{cavityBlock.topDepthInMetres.toFixed(3)}</Text>
				<Text></Text>
				<Text>{cavityBlock.baseDepthInMetres.toFixed(3)}</Text>
			</View>
			<View style={{ flex: 1 }}>
				<Text>{cavityBlock.cavityDescription}</Text>
			</View>
		</View>
	);
}