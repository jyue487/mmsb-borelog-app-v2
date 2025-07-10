import { Text, View, type ViewProps } from "react-native";

import { SptBlock } from '@/types/SptBlock';

export type SptBlockProps = ViewProps & {
	sptBlock: SptBlock
};

export function SptBlockComponent({ style, sptBlock, ...otherProps }: SptBlockProps) {
	return (
		<View style={[{ flexDirection: 'row'}, style]} {...otherProps}>
			<View style={{ backgroundColor: 'red', height: '100%', width: 70, paddingHorizontal: 1, alignItems: 'center'}}>
				<Text>{sptBlock.topDepth.toFixed(3)}</Text>
				<View style={{ flex: 1 }}></View>
				<Text>P{sptBlock.sptIndex}</Text>
				<Text>D{(sptBlock.recoveryLength === 0) ? '*' : sptBlock.disturbedSampleIndex}</Text>
				<View style={{ flex: 1 }}></View>
				<Text>{sptBlock.baseDepth.toFixed(3)}</Text>
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
								<Text>{sptBlock.seatingIncPen1}</Text>
							</View>
							<View style={{ flex: 1, alignItems: 'center' }}>
								<Text>{sptBlock.seatingIncBlows2}</Text>
								<Text>{sptBlock.seatingIncPen2}</Text>
							</View>
						</View>
					</View>
					<View style={{ flex: 4, borderLeftWidth: 0.25, borderRightWidth: 0.25, alignItems: 'center' }}>
						<Text>Test Drive</Text>
						<View style={{ flexDirection: 'row' }}>
							<View style={{ flex: 1, alignItems: 'center' }}>
								<Text>{sptBlock.mainIncBlows1}</Text>
								<Text>{sptBlock.mainIncPen1}</Text>
							</View>
							<View style={{ flex: 1, alignItems: 'center' }}>
								<Text>{sptBlock.mainIncBlows2}</Text>
								<Text>{sptBlock.mainIncPen2}</Text>
							</View>
							<View style={{ flex: 1, alignItems: 'center' }}>
								<Text>{sptBlock.mainIncBlows3}</Text>
								<Text>{sptBlock.mainIncPen3}</Text>
							</View>
							<View style={{ flex: 1, alignItems: 'center' }}>
								<Text>{sptBlock.mainIncBlows4}</Text>
								<Text>{sptBlock.mainIncPen4}</Text>
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
						<Text>{(sptBlock.recoveryLength / (sptBlock.baseDepth - sptBlock.topDepth) / 10).toFixed(0)}</Text>
					</View>
				</View>
			</View>
		</View>
	);
}