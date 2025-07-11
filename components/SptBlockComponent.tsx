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
								<Text>{sptBlock.seatingIncBlows1 < 25 ? sptBlock.seatingIncBlows2 : undefined}</Text>
								<Text>{sptBlock.seatingIncBlows1 < 25 ? sptBlock.seatingIncPen2 : undefined}</Text>
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
								<Text>{sptBlock.mainIncBlows1 < 50 ? sptBlock.mainIncBlows2 : undefined}</Text>
								<Text>{sptBlock.mainIncBlows1 < 50 ? sptBlock.mainIncPen2 : undefined}</Text>
							</View>
							<View style={{ flex: 1, alignItems: 'center' }}>
								<Text>{sptBlock.mainIncBlows1 + sptBlock.mainIncBlows2 < 50 ? sptBlock.mainIncBlows3 : undefined}</Text>
								<Text>{sptBlock.mainIncBlows1 + sptBlock.mainIncBlows2 < 50 ? sptBlock.mainIncPen3 : undefined}</Text>
							</View>
							<View style={{ flex: 1, alignItems: 'center' }}>
								<Text>{sptBlock.mainIncBlows1 + sptBlock.mainIncBlows2 + sptBlock.mainIncBlows3 < 50 ?  sptBlock.mainIncBlows4 : undefined}</Text>
								<Text>{sptBlock.mainIncBlows1 + sptBlock.mainIncBlows2 + sptBlock.mainIncBlows3 < 50 ?  sptBlock.mainIncPen4 : undefined}</Text>
							</View>
						</View>
					</View>
					<View style={{ flex: 1, borderLeftWidth: 0.25, borderRightWidth: 0.25, alignItems: 'center' }}>
						<Text>N</Text>
						<Text>{sptBlock.sptNValue}</Text>
						<Text>{sptBlock.sptNValue === 50 ? (sptBlock.mainIncPen1 + sptBlock.mainIncPen2 + sptBlock.mainIncPen3 + sptBlock.mainIncPen4) : undefined}
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