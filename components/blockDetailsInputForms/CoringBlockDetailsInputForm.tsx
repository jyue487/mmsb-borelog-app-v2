import React, { useState } from "react";
import { Button, Keyboard, StyleSheet, Text, TextInput, TouchableOpacity, View, type ViewProps } from "react-native";
import { FlatList, GestureHandlerRootView } from "react-native-gesture-handler";

import { CORING_BLOCK_TYPE_ID } from "@/constants/BlockTypeId";
import { Colour, DOMINANT_COLOUR_LIST, SECONDARY_COLOUR_LIST } from "@/constants/colour";
import { OTHER_PROPERTIES_LIST_BASED_ON_ROCK_TYPE, ROCK_TYPE_LIST, RockType } from "@/constants/rock";
import { Block } from "@/types/Block";

export type CoringBlockDetailsInputFormProps = ViewProps & {
	boreholeId: number;
	blocks: Block[];
	setBlocks: React.Dispatch<React.SetStateAction<Block[]>>;
	setIsAddNewBlockButtonPressed: (isPressed: boolean) => void;
};

export function CoringBlockDetailsInputForm({ style, boreholeId, blocks, setBlocks, setIsAddNewBlockButtonPressed, ...otherProps }: CoringBlockDetailsInputFormProps) {
	const [topDepthInMetresStr, setTopDepthInMetresStr] = useState<string>('');
	const [coreRunInMetresStr, setCoreRunInMetresStr] = useState<string>('');
	const [coreRecoveryInMetresStr, setCoreRecoveryInMetresStr] = useState<string>('');
	const [rqdInMetresStr, setRqdInMetresStr] = useState<string>('');
	const [dominantColour, setDominantColour] = useState<Colour>();
	const [isSelectDominantColourPressed, setIsSelectDominantColourPressed] = useState<boolean>(false);
	const [secondaryColour, setSecondaryColour] = useState<Colour>();
	const [isSelectSecondaryColourPressed, setIsSelectSecondaryColourPressed] = useState<boolean>(false);
	const [rockType, setRockType] = useState<RockType>();
	const [isSelectRockTypePressed, setIsSelectRockTypePressed] = useState<boolean>(false);
	const [otherRockType, setOtherRockType] = useState<string>('');
	const [otherProperties, setOtherProperties] = useState<string>('');
	const [isSelectOtherPropertiesPressed, setIsSelectOtherPropertiesPressed] = useState<boolean>(false);

	const resetCoreRecovery = () => {
		setCoreRecoveryInMetresStr('');
	};
	const resetRqd = () => {
		setRqdInMetresStr('');
	};

	return (
		<GestureHandlerRootView>
			<View style={{ paddingVertical: 20, gap: 20 }}>
				<View style={{ flexDirection: 'row', alignItems: 'center' }}>
					<Text>Top Depth(m)<Text style={{ color: 'red' }}>*</Text>: </Text>
					<TextInput
						value={topDepthInMetresStr}
						onChangeText={setTopDepthInMetresStr}
						style={{ borderWidth: 0.5, alignItems: 'center', padding: 10, flex: 1 }}
						keyboardType='numeric'
					/>
				</View>
				<View style={{ flexDirection: 'row', alignItems: 'center' }}>
					<Text>Core Run(m)<Text style={{ color: 'red' }}>*</Text>: </Text>
					<TextInput
						value={coreRunInMetresStr}
						onChangeText={(text: string) => {
							setCoreRunInMetresStr(text);
							resetCoreRecovery();
							resetRqd();
						}}
						style={{ borderWidth: 0.5, alignItems: 'center', padding: 10, flex: 1 }}
						keyboardType='numeric'
					/>
				</View>
				<View style={{ flexDirection: 'row', alignItems: 'center' }}>
					<Text>Core Recovery(m)<Text style={{ color: 'red' }}>*</Text>: </Text>
					<TextInput
						value={coreRecoveryInMetresStr}
						onChangeText={(text: string) => {
							const coreRunInMetres: number = parseFloat(parseFloat(coreRunInMetresStr).toFixed(3));
							if (isNaN(coreRunInMetres) || coreRunInMetres <= 0) {
								return;
							}
							setCoreRecoveryInMetresStr(text);
							const coreRecoveryInMetres: number = parseFloat(parseFloat(text).toFixed(3));
							if (isNaN(coreRecoveryInMetres)) {
                return;
              }
              if (coreRecoveryInMetres > coreRunInMetres) {
                setCoreRecoveryInMetresStr(coreRunInMetres.toString());
              }
						}}
						style={{ borderWidth: 0.5, textAlign: 'center', padding: 10, width: 70 }}
						keyboardType='numeric'
					/>
					<Text>
						{(() => {
							const coreRunInMetres: number = parseFloat(parseFloat(coreRunInMetresStr).toFixed(3));
							return (coreRunInMetres > 0) ? `   /   ${coreRunInMetres}` : undefined;
						})()}
					</Text>
				</View>
				<View style={{ flexDirection: 'row', alignItems: 'center' }}>
					<Text>R.Q.D.(m)<Text style={{ color: 'red' }}>*</Text>: </Text>
					<TextInput
						value={rqdInMetresStr}
						onChangeText={(text: string) => {
							const coreRunInMetres: number = parseFloat(parseFloat(coreRunInMetresStr).toFixed(3));
							if (isNaN(coreRunInMetres) || coreRunInMetres <= 0) {
								return;
							}
							setRqdInMetresStr(text);
							const rqdInMetres: number = parseFloat(parseFloat(text).toFixed(3));
							if (isNaN(rqdInMetres)) {
                return;
              }
              if (rqdInMetres > coreRunInMetres) {
                setRqdInMetresStr(coreRunInMetres.toString());
              }
						}}
						style={{ borderWidth: 0.5, textAlign: 'center', padding: 10, width: 70 }}
						keyboardType='numeric'
					/>
					<Text>
						{(() => {
							const coreRunInMetres: number = parseFloat(parseFloat(coreRunInMetresStr).toFixed(3));
							return (coreRunInMetres > 0) ? `   /   ${coreRunInMetres}` : undefined;
						})()}
					</Text>
				</View>
				<View style={{ flexDirection: 'row' }}>
					<Text style={{ paddingVertical: 10 }}>Dominant Colour<Text style={{ color: 'red' }}>*</Text>: </Text>
					<View style={{ flex: 1 }}>
						<TouchableOpacity 
							onPress={() => {
								Keyboard.dismiss();
								setIsSelectDominantColourPressed(prev => !prev);
							}}
							style={{
								borderWidth: 0.5,
								alignItems: 'center',
								padding: 10,
								width: '100%',
								backgroundColor: (!dominantColour) ? 'transparent' : dominantColour.colourCode,
							}}>
							{
								(!dominantColour) 
								? <Text></Text> 
								: <Text style={{ color: dominantColour.colourTagFontColour }}>{dominantColour.colourTag}</Text>
							}
						</TouchableOpacity>
						{
							isSelectDominantColourPressed && (
								<FlatList
									data={DOMINANT_COLOUR_LIST}
									keyExtractor={item => item.colourCode}
									renderItem={({ item }) => (
										<TouchableOpacity 
											onPress={() => {
												setDominantColour(item);
												setIsSelectDominantColourPressed(false);
												setSecondaryColour(undefined);
												setIsSelectSecondaryColourPressed(false);
											}}
											style={[styles.listItem, { backgroundColor: item.colourCode }]}>
											<Text style={{ color: item.colourTagFontColour }}>{item.colourTag}</Text>
										</TouchableOpacity>
									)}
									nestedScrollEnabled={true}
									style={{ maxHeight: 500 }}
								/>
							)
						}
					</View>
				</View>
				<View style={{ flexDirection: 'row' }}>
					<Text style={{ paddingVertical: 10 }}>Secondary Colour: </Text>
					<View style={{ flex: 1 }}>
						<TouchableOpacity 
							onPress={() => {
								Keyboard.dismiss();
								setIsSelectSecondaryColourPressed(prev => !prev);
							}}
							style={{
								borderWidth: 0.5,
								alignItems: 'center',
								padding: 10,
								width: '100%',
								backgroundColor: (!secondaryColour) ? 'transparent' : secondaryColour.colourCode,
							}}>
							{
								(!secondaryColour) 
								? <Text></Text> 
								: <Text style={{ color: secondaryColour.colourTagFontColour }}>{secondaryColour.colourTag}</Text>
							}
						</TouchableOpacity>
						{
							isSelectSecondaryColourPressed && (
								<FlatList
									data={SECONDARY_COLOUR_LIST.filter((colour: Colour) => dominantColour && colour.colourFamily != dominantColour.colourFamily)}
									keyExtractor={item => item.colourCode}
									renderItem={({ item }) => (
										<TouchableOpacity 
											onPress={() => {
												setSecondaryColour(item);
												setIsSelectSecondaryColourPressed(false);
											}}
											style={[styles.listItem, { backgroundColor: item.colourCode }]}>
											<Text style={{ color: item.colourTagFontColour }}>{item.colourTag}</Text>
										</TouchableOpacity>
									)}
									nestedScrollEnabled={true}
									style={{ maxHeight: 500 }}
								/>
							)
						}
					</View>
				</View>
				<View style={{ flexDirection: 'row' }}>
					<Text style={{ paddingVertical: 10 }}>Rock Type<Text style={{ color: 'red' }}>*</Text>: </Text>
					<View style={{ flex: 1 }}>
						<TouchableOpacity 
							onPress={() => {
								Keyboard.dismiss();
								setIsSelectRockTypePressed(prev => !prev);
							}}
							style={{
								borderWidth: 0.5,
								alignItems: 'center',
								padding: 10,
								width: '100%',
							}}>
							<Text>{rockType}</Text>
						</TouchableOpacity>
						{
							isSelectRockTypePressed && (
								<FlatList
									data={ROCK_TYPE_LIST}
									keyExtractor={item => item}
									renderItem={({ item }) => (
										<TouchableOpacity 
											onPress={() => {
												setRockType(item);
												setIsSelectRockTypePressed(false);
												setOtherRockType('');
											}}
											style={[styles.listItem]}>
											<Text>{item}</Text>
										</TouchableOpacity>
									)}
									style={{ maxHeight: 500 }}
								/>
							)
						}
						{
							rockType === 'OTHERS' && (
								<TextInput
									value={otherRockType}
									onChangeText={(text: string) => {
										setOtherRockType(text.toUpperCase());
									}}
									style={{ borderWidth: 0.5, padding: 10, textAlign: 'center' }}
								/>
							)
						}
					</View>
				</View>
				<View style={{ flexDirection: 'row' }}>
					<Text style={{ paddingVertical: 10 }}>Other Properties: </Text>
					<View style={{ flex: 1 }}>
						<TouchableOpacity 
							onPress={() => {
								Keyboard.dismiss();
								setIsSelectOtherPropertiesPressed(prev => !prev);
							}}
							style={{
								borderWidth: 0.5,
								alignItems: 'center',
								padding: 10,
								width: '100%',
							}}>
							<Text>{otherProperties}</Text>
						</TouchableOpacity>
						{
							isSelectOtherPropertiesPressed && (
								<FlatList
									data={(!rockType) ? [] : OTHER_PROPERTIES_LIST_BASED_ON_ROCK_TYPE[rockType]}
									keyExtractor={item => item}
									renderItem={({ item }) => (
										<TouchableOpacity 
											onPress={() => {
												setOtherProperties(item);
												setIsSelectOtherPropertiesPressed(false);
											}}
											style={[styles.listItem]}>
											<Text>{item}</Text>
										</TouchableOpacity>
									)}
									style={{ maxHeight: 500 }}
								/>
							)
						}
					</View>
				</View>
			</View>
			<Button
				title='Confirm'
				onPress={() => {
					if (isNaN(parseFloat(topDepthInMetresStr)) || parseFloat(topDepthInMetresStr) < 0) {
						alert('Error: Top Depth');
						return;
					}
					if (isNaN(parseFloat(coreRunInMetresStr)) || parseFloat(coreRunInMetresStr) < 0) {
						alert('Error: Core Run');
						return;
					}
					if (isNaN(parseFloat(coreRecoveryInMetresStr)) || parseFloat(coreRecoveryInMetresStr) < 0) {
						alert('Error: Core Recovery');
						return;
					}
					if (isNaN(parseFloat(rqdInMetresStr)) || parseFloat(rqdInMetresStr) < 0) {
						alert('Error: R.Q.D.');
						return;
					}
					if (!dominantColour) {
						alert('Error: Dominant Colour');
						return;
					}
					if (!rockType) {
						alert('Error: Rock Type');
						return;
					}

					const topDepthInMetres: number = parseFloat(parseFloat(topDepthInMetresStr).toFixed(3));
					const topDepthInMillimetres: number = topDepthInMetres * 1000;
					const coreRunInMetres: number = parseFloat(parseFloat(coreRunInMetresStr).toFixed(3));
					const coreRunInMillimetres: number = coreRunInMetres * 1000;
					const coreRecoveryInMetres: number = parseFloat(parseFloat(coreRecoveryInMetresStr).toFixed(3));
					const coreRecoveryInMillimetres: number = coreRecoveryInMetres * 1000;
					const rqdInMetres: number = parseFloat(parseFloat(rqdInMetresStr).toFixed(3));
					const rqdInMillimetres: number = rqdInMetres * 1000;

					const baseDepthInMetres: number = (topDepthInMillimetres + coreRunInMillimetres) / 1000;
					const coreRecoveryInPercentage: number = parseFloat((coreRecoveryInMillimetres / coreRunInMillimetres * 100).toFixed(1));
					const rqdInPercentage: number = parseFloat((rqdInMillimetres / coreRunInMillimetres * 100).toFixed(1));

					let rockDescription: string = '';

					let rockStrength: string = '';
					if (rqdInPercentage <= 50) {
						rockStrength = 'Moderately strong';
					} else if (rqdInPercentage <= 75) {
						rockStrength = 'Strong';
					} else {
						rockStrength = 'Very strong';
					}
					rockDescription += `${rockStrength},`;

					const totalColourLevel = dominantColour.level;
					let colourLevel = '';
					if (totalColourLevel <= 1) {
						colourLevel = 'dark';
					} else if (totalColourLevel <= 2) {
						colourLevel = 'medium';
					} else if (totalColourLevel <= 3) {
						colourLevel = 'light';
					} else {
						colourLevel = 'pale';
					}
					rockDescription += ` ${colourLevel}`;

					let colourDescription = '';
					if (!secondaryColour) {
						colourDescription = `${dominantColour.colourNameForSoilDescription}`;
					} else {
						colourDescription = `${secondaryColour.colourNameForSoilDescription} ${dominantColour.colourNameForSoilDescription}`;
					}
					rockDescription += ` ${colourDescription}`;

					let weatheringClassification = '';
					if (rqdInPercentage < 25) {
						weatheringClassification = 'highly weathered (Grade IV), very poor';
					} else if (rqdInPercentage <= 50) {
						weatheringClassification = 'moderately weathered (Grade III), poor';
					} else if (rqdInPercentage <= 75) {
						weatheringClassification = 'slightly weathered (Grade II), fair';
					} else if (rqdInPercentage <= 85) {
						weatheringClassification = 'slightly weathered (Grade II) to fresh, good';
					} else {
						weatheringClassification = 'fresh (Grade I), excellent';
					}
					rockDescription += ` ${weatheringClassification}`;

					let rockTypeDescription = '';
					if (rockType === 'OTHERS') {
						rockTypeDescription = otherRockType;
					} else {
						rockTypeDescription = rockType;
					}
					rockDescription += ` ${rockTypeDescription}`;

					const rockSampleIndex: number = (coreRecoveryInMetres === 0 ) ? -1 : blocks.filter((block: Block) => block.blockType === 'Coring').length + 1;

					const newCoringBlock: Block = {
						id: blocks.length + 1,
						blockTypeId: CORING_BLOCK_TYPE_ID,
						blockType: 'Coring',
						boreholeId: boreholeId, 
						blockId: 1,
						rockSampleIndex: rockSampleIndex,
						topDepthInMetres: topDepthInMetres,
						baseDepthInMetres: baseDepthInMetres,
						rockDescription: rockDescription,
						coreRunInMetres: coreRunInMetres,
						coreRecoveryInPercentage: coreRecoveryInPercentage,
						rqdInPercentage: rqdInPercentage,
					};
					setBlocks(blocks => [...blocks, newCoringBlock]);
					setIsAddNewBlockButtonPressed(false);
				}}
			/>
		</GestureHandlerRootView>
	);
}

const styles = StyleSheet.create({
	listItem: {
		borderLeftWidth: 0.25,
		borderRightWidth: 0.25,
		borderBottomWidth: 0.25,
		alignItems: 'center',
		padding: 10,
	}
});