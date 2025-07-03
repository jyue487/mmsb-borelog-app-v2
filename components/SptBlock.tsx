import { Text, View, type ViewProps } from "react-native";

import { SptBlock } from '@/types/SptBlock';

export type SptBlockProps = ViewProps & {
	sptBlock: SptBlock
};

export function SptBlockComponent({ style, sptBlock, ...otherProps }: SptBlockProps) {
	return (
		<View style={[{ flexDirection: 'row'}, style]} {...otherProps}>
			<View style={{ backgroundColor: 'red', height: '100%', width: 50, paddingHorizontal: 1, alignItems: 'center'}}>
				<Text>{sptBlock.topDepthInMetres.toFixed(2)}</Text>
				<View style={{ flex: 1 }}></View>
				<Text>D{sptBlock.block_id}/P{sptBlock.block_id}</Text>
				<View style={{ flex: 1 }}></View>
				<Text>{sptBlock.baseDepthInMetres.toFixed(2)}</Text>
			</View>
			<View style={{ flex: 1 }}>
				<Text>{sptBlock.soilDescription}</Text>
				<Text></Text>
				<View style={{ flexDirection: 'row' }}>
					<View style={{ flex: 2, borderRightWidth: 0.25, alignItems: 'center' }}>
						<Text>Seating</Text>
						<View style={{ flexDirection: 'row'}}>
							<View style={{ flex: 1, alignItems: 'center'}}>
								<Text>{sptBlock.seatingIncBlows1}</Text>
								<Text>75</Text>
							</View>
							<View style={{ flex: 1, alignItems: 'center' }}>
								<Text>{sptBlock.seatingIncBlows2}</Text>
								<Text>75</Text>
							</View>
						</View>
					</View>
					<View style={{ flex: 4, borderLeftWidth: 0.25, borderRightWidth: 0.25, alignItems: 'center' }}>
						<Text>Test Drive</Text>
						<View style={{ flexDirection: 'row' }}>
							<View style={{ flex: 1, alignItems: 'center' }}>
								<Text>{sptBlock.mainIncBlows1}</Text>
								<Text>75</Text>
							</View>
							<View style={{ flex: 1, alignItems: 'center' }}>
								<Text>{sptBlock.mainIncBlows2}</Text>
								<Text>75</Text>
							</View>
							<View style={{ flex: 1, alignItems: 'center' }}>
								<Text>{sptBlock.mainIncBlows3}</Text>
								<Text>75</Text>
							</View>
							<View style={{ flex: 1, alignItems: 'center' }}>
								<Text>{sptBlock.mainIncBlows4}</Text>
								<Text>75</Text>
							</View>
						</View>
					</View>
					<View style={{ flex: 1, borderLeftWidth: 0.25, borderRightWidth: 0.25, alignItems: 'center' }}>
						<Text>N</Text>
						<Text>
							{
								sptBlock.mainIncBlows1 
								+ sptBlock.mainIncBlows2 
								+ sptBlock.mainIncBlows3 
								+ sptBlock.mainIncBlows4
							}
						</Text>
					</View>
					<View style={{ flex: 1, borderLeftWidth: 0.25, alignItems: 'center' }}>
						<Text>R%</Text>
						<Text>88</Text>
					</View>
				</View>
			</View>
		</View>
	);
}