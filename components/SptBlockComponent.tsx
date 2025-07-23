import { Text, View, type ViewProps } from "react-native";

import { SptBlock } from '@/interfaces/SptBlock';
import { getDateTime } from "@/utils/datetime";
import { DAY_CONTINUE_WORK_TYPE } from "@/constants/DayStatus";

export type SptBlockProps = ViewProps & {
	sptBlock: SptBlock
};

export function SptBlockComponent({ style, sptBlock, ...otherProps }: SptBlockProps) {
	return (
		<View style={[{ flexDirection: 'row'}, style]} {...otherProps}>
			<View style={{ backgroundColor: 'red', height: '100%', width: 70, paddingHorizontal: 1, alignItems: 'center'}}>
				<Text>{sptBlock.topDepthInMetres.toFixed(3)}</Text>
				<View style={{ flex: 1 }}></View>
				<Text>P{sptBlock.sptIndex}</Text>
				<Text>D{(sptBlock.recoveryLengthInMillimetres === 0) ? '*' : sptBlock.disturbedSampleIndex}</Text>
				<View style={{ flex: 1 }}></View>
				<Text>{sptBlock.baseDepthInMetres.toFixed(3)}</Text>
			</View>
			<View style={{ flex: 1 }}>
				<View style={{ flexDirection: 'row' }}>
					<View style={{ flex: 1 }}><Text>{sptBlock.soilDescription}</Text></View>
					{
						(sptBlock.dayWorkStatus.dayWorkStatusType !== DAY_CONTINUE_WORK_TYPE) && (
							<View style={{ alignItems: 'flex-end' }}>
								<Text>{sptBlock.dayWorkStatus.dayWorkStatusType}</Text>
								<Text>{getDateTime(sptBlock.dayWorkStatus.date, sptBlock.dayWorkStatus.time)}</Text>
								<Text>Water Level: {sptBlock.dayWorkStatus.waterLevelInMetres}m</Text>
								<Text>Casing Depth: {sptBlock.dayWorkStatus.casingDepthInMetres}m</Text>
							</View>
						)
					}
				</View>
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
						<Text>{(sptBlock.recoveryLengthInMillimetres / (sptBlock.baseDepthInMetres - sptBlock.topDepthInMetres) / 10).toFixed(0)}</Text>
					</View>
				</View>
			</View>
		</View>
	);
}