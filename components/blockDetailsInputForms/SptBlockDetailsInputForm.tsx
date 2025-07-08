import { Button, Text, TextInput, View, type ViewProps } from "react-native";

import { Block } from "@/types/Block";
import { SPT_BLOCK_TYPE_ID } from "@/constants/BlockTypeId";

export type SptBlockDetailsInputFormProps = ViewProps & {
	borehole_id: number;
	addNewBlock: (block: Block) => void;
	setIsAddNewBlockButtonPressed: (isPressed: boolean) => void;
};

export function SptBlockDetailsInputForm({ style, borehole_id, addNewBlock, setIsAddNewBlockButtonPressed, ...otherProps }: SptBlockDetailsInputFormProps) {

	return (
		<View>
			<View>
				<Text>SptBlockDetailsInputForm</Text>
				<View style={{ flexDirection: 'row', alignItems: 'center' }}>
					<Text>Top Depth(m): </Text>
					<TextInput
						style={{ borderWidth: 0.5, alignItems: 'center', padding: 10, flex: 1 }}
						keyboardType='numeric'
					/>
				</View>
				<View style={{ flexDirection: 'row', alignItems: 'center' }}>
					<Text>Base Depth(m): </Text>
					<TextInput
						style={{ borderWidth: 0.5, alignItems: 'center', padding: 10, flex: 1 }}
						keyboardType='numeric'
					/>
				</View>
				<View style={{ flexDirection: 'row', alignItems: 'center' }}>
					<Text>Soil Description: </Text>
					<TextInput
						style={{ borderWidth: 0.5, alignItems: 'center', padding: 10, flex: 1 }}
					/>
				</View>
				<View style={{ flexDirection: 'row' }}>
					<View style={{ flex: 2 }}>
						<Text>Seating</Text>
						<View style={{ flexDirection: 'row' }}>
							<View style={{ flex: 1 }}>
								<TextInput
									style={{ borderWidth: 0.5, textAlign: 'center', paddingVertical: 10 }}
									keyboardType='numeric'
								/>
								<TextInput
									style={{ borderWidth: 0.5, textAlign: 'center', paddingVertical: 10 }}
									keyboardType='numeric'
								/>
							</View>
							<View style={{ flex: 1 }}>
								<TextInput
									style={{ borderWidth: 0.5, textAlign: 'center', paddingVertical: 10 }}
									keyboardType='numeric'
								/>
								<TextInput
									style={{ borderWidth: 0.5, textAlign: 'center', paddingVertical: 10 }}
									keyboardType='numeric'
								/>
							</View>
						</View>
					</View>
					<View style={{ flex: 4 }}>
						<Text>Test Drive</Text>
						<View style={{ flexDirection: 'row' }}>
							<View style={{ flex: 1 }}>
								<TextInput
									style={{ borderWidth: 0.5, textAlign: 'center', paddingVertical: 10 }}
									keyboardType='numeric'
								/>
								<TextInput
									style={{ borderWidth: 0.5, textAlign: 'center', paddingVertical: 10 }}
									keyboardType='numeric'
								/>
							</View>
							<View style={{ flex: 1 }}>
								<TextInput
									style={{ borderWidth: 0.5, textAlign: 'center', paddingVertical: 10 }}
									keyboardType='numeric'
								/>
								<TextInput
									style={{ borderWidth: 0.5, textAlign: 'center', paddingVertical: 10 }}
									keyboardType='numeric'
								/>
							</View>
							<View style={{ flex: 1 }}>
								<TextInput
									style={{ borderWidth: 0.5, textAlign: 'center', paddingVertical: 10 }}
									keyboardType='numeric'
								/>
								<TextInput
									style={{ borderWidth: 0.5, textAlign: 'center', paddingVertical: 10 }}
									keyboardType='numeric'
								/>
							</View>
							<View style={{ flex: 1 }}>
								<TextInput
									style={{ borderWidth: 0.5, textAlign: 'center', paddingVertical: 10 }}
									keyboardType='numeric'
								/>
								<TextInput
									style={{ borderWidth: 0.5, textAlign: 'center', paddingVertical: 10 }}
									keyboardType='numeric'
								/>
							</View>
						</View>
					</View>
				</View>
			</View>
			<Button
				title='Confirm'
				onPress={() => {
					const newSptBlock: Block = {
						id: 1, 
						block_type_id: SPT_BLOCK_TYPE_ID,
						block_type: 'Spt',
						borehole_id: borehole_id, 
						block_id: 1,
						topDepthInMetres: 75,
						baseDepthInMetres: 75.09,
						soilDescription: 'Loose, light yellowish, grey silty SAND with traces of decayed wood',
						seatingIncBlows1: 1,
						seatingIncPen1: 75,
						seatingIncBlows2: 2,
						seatingIncPen2: 75,
						mainIncBlows1: 2,
						mainIncPen1: 75,
						mainIncBlows2: 4,
						mainIncPen2: 75,
						mainIncBlows3: 4,
						mainIncPen3: 75,
						mainIncBlows4: 4,
						mainIncPen4: 75,
					};
					addNewBlock(newSptBlock);
					setIsAddNewBlockButtonPressed(false);
				}}
			/>
		</View>
	);
}