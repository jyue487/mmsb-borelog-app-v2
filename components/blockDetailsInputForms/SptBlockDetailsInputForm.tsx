import React, { useState } from "react";
import { Button, StyleSheet, Text, TextInput, TouchableOpacity, View, type ViewProps } from "react-native";
import { GestureHandlerRootView, FlatList } from "react-native-gesture-handler";

import { SPT_BLOCK_TYPE_ID } from "@/constants/BlockTypeId";
import { Colour, DOMINANT_COLOUR_LIST, SECONDARY_COLOUR_LIST } from "@/constants/colour";
import {
	DOMINANT_SOIL_TYPE_LIST,
	DominantSoilType,
	OTHER_PROPERTIES_LIST_BASED_ON_DOMINANT_SOIL_TYPE,
	SECONDARY_SOIL_TYPE_LIST_BASED_ON_DOMINANT_SOIL_TYPE,
	SecondarySoilType
} from "@/constants/soil";
import { Block } from "@/types/Block";

export type SptBlockDetailsInputFormProps = ViewProps & {
	boreholeId: number;
	blocks: Block[];
	setBlocks: React.Dispatch<React.SetStateAction<Block[]>>;
	setIsAddNewBlockButtonPressed: (isPressed: boolean) => void;
};

export function SptBlockDetailsInputForm({ style, boreholeId, blocks, setBlocks, setIsAddNewBlockButtonPressed, ...otherProps }: SptBlockDetailsInputFormProps) {
	const [topDepthInMetresStr, setTopDepthInMetresStr] = useState<string>('');
	const [seatingIncBlows1Str, setSeatingIncBlows1Str] = useState<string>('');
	const [seatingIncBlows2Str, setSeatingIncBlows2Str] = useState<string>('');
	const [seatingIncPen1Str, setSeatingIncPen1Str] = useState<string>('');
	const [seatingIncPen2Str, setSeatingIncPen2Str] = useState<string>('');
	const [mainIncBlows1Str, setMainIncBlows1Str] = useState<string>('');
	const [mainIncBlows2Str, setMainIncBlows2Str] = useState<string>('');
	const [mainIncBlows3Str, setMainIncBlows3Str] = useState<string>('');
	const [mainIncBlows4Str, setMainIncBlows4Str] = useState<string>('');
	const [mainIncPen1Str, setMainIncPen1Str] = useState<string>('');
	const [mainIncPen2Str, setMainIncPen2Str] = useState<string>('');
	const [mainIncPen3Str, setMainIncPen3Str] = useState<string>('');
	const [mainIncPen4Str, setMainIncPen4Str] = useState<string>('');
	const [isSeatingIncBlows1Active, setIsSeatingIncBlows1Active] = useState<boolean>(true);
	const [isSeatingIncBlows2Active, setIsSeatingIncBlows2Active] = useState<boolean>(false);
	const [isMainIncBlows1Active, setIsMainIncBlows1Active] = useState<boolean>(false);
	const [isMainIncBlows2Active, setIsMainIncBlows2Active] = useState<boolean>(false);
	const [isMainIncBlows3Active, setIsMainIncBlows3Active] = useState<boolean>(false);
	const [isMainIncBlows4Active, setIsMainIncBlows4Active] = useState<boolean>(false);
	const [isSeatingIncPen1Active, setIsSeatingIncPen1Active] = useState<boolean>(false);
	const [isSeatingIncPen2Active, setIsSeatingIncPen2Active] = useState<boolean>(false);
	const [isMainIncPen1Active, setIsMainIncPen1Active] = useState<boolean>(false);
	const [isMainIncPen2Active, setIsMainIncPen2Active] = useState<boolean>(false);
	const [isMainIncPen3Active, setIsMainIncPen3Active] = useState<boolean>(false);
	const [isMainIncPen4Active, setIsMainIncPen4Active] = useState<boolean>(false);
	const [dominantColour, setDominantColour] = useState<Colour>();
	const [isSelectDominantColourPressed, setIsSelectDominantColourPressed] = useState<boolean>(false);
	const [secondaryColour, setSecondaryColour] = useState<Colour>();
	const [isSelectSecondaryColourPressed, setIsSelectSecondaryColourPressed] = useState<boolean>(false);
	const [dominantSoilType, setDominantSoilType] = useState<DominantSoilType>();
	const [isSelectDominantSoilTypePressed, setIsSelectDominantSoilTypePressed] = useState<boolean>(false);
	const [secondarySoilType, setSecondarySoilType] = useState<SecondarySoilType>();
	const [isSelectSecondarySoilTypePressed, setIsSelectSecondarySoilTypePressed] = useState<boolean>(false);
	const [otherProperties, setOtherProperties] = useState<string>('');
	const [isSelectOtherPropertiesPressed, setIsSelectOtherPropertiesPressed] = useState<boolean>(false);
	const [recoveryLengthInMillimetresStr, setRecoveryLengthInMillimetresStr] = useState<string>('');

	const resetSeatingInc1 = () => {
		setSeatingIncBlows1Str('');
		setSeatingIncPen1Str('');
		setIsSeatingIncBlows1Active(false);
		setIsSeatingIncPen1Active(false);
	};
	const resetSeatingInc2 = () => {
		setSeatingIncBlows2Str('');
		setSeatingIncPen2Str('');
		setIsSeatingIncBlows2Active(false);
		setIsSeatingIncPen2Active(false);
	};
	const resetMainInc1 = () => {
		setMainIncBlows1Str('');
		setMainIncPen1Str('');
		setIsMainIncBlows1Active(false);
		setIsMainIncPen1Active(false);
	};
	const resetMainInc2 = () => {
		setMainIncBlows2Str('');
		setMainIncPen2Str('');
		setIsMainIncBlows2Active(false);
		setIsMainIncPen2Active(false);
	};
	const resetMainInc3 = () => {
		setMainIncBlows3Str('');
		setMainIncPen3Str('');
		setIsMainIncBlows3Active(false);
		setIsMainIncPen3Active(false);
	};
	const resetMainInc4 = () => {
		setMainIncBlows4Str('');
		setMainIncPen4Str('');
		setIsMainIncBlows4Active(false);
		setIsMainIncPen4Active(false);
	};
	const resetRecoveryLength = () => {
		setRecoveryLengthInMillimetresStr('');
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
				<View style={{ flexDirection: 'row' }}>
					<View style={{ flex: 2 }}>
						<Text>Seating<Text style={{ color: 'red' }}>*</Text></Text>
						<View style={{ flexDirection: 'row' }}>
							<View style={{ flex: 1 }}>
								<TextInput
									value={seatingIncBlows1Str}
									onChangeText={(text: string) => {
										setSeatingIncBlows1Str(text);
										resetSeatingInc2();
										resetMainInc1();
										resetMainInc2();
										resetMainInc3();
										resetMainInc4();
										resetRecoveryLength();

										const seatingIncBlows1: number = parseInt(text);
										if (isNaN(seatingIncBlows1)) {
											setIsSeatingIncPen1Active(false);
											setSeatingIncPen1Str('');
											setIsSeatingIncBlows2Active(false);
											return;
										}
										if (seatingIncBlows1 >= 25) {
											setSeatingIncBlows1Str('25');
											setSeatingIncPen1Str('');
											setIsSeatingIncPen1Active(true);
											setIsSeatingIncBlows2Active(false);
											return;
										}
										setIsSeatingIncPen1Active(false);
										setIsSeatingIncBlows2Active(true);
										setSeatingIncPen1Str('75');
									}}
									editable={isSeatingIncBlows1Active}
									style={(isSeatingIncBlows1Active) ? styles.smallInputBoxActive : styles.smallInputBoxInactive}
									keyboardType='numeric'
								/>
								<TextInput
									value={seatingIncPen1Str}
									onChangeText={(text: string) => {
										setSeatingIncPen1Str(text);
										resetSeatingInc2();
										resetMainInc1();
										resetMainInc2();
										resetMainInc3();
										resetMainInc4();
										resetRecoveryLength();
										const seatingIncPen1: number = parseInt(text);
										if (isNaN(seatingIncPen1)) {
											setIsMainIncBlows1Active(false);
											return;
										}
										setIsMainIncBlows1Active(true);
										if (seatingIncPen1 > 75) {
											setSeatingIncPen1Str('75');
										}
									}}
									editable={isSeatingIncPen1Active}
									style={(isSeatingIncPen1Active) ? styles.smallInputBoxActive : styles.smallInputBoxInactive}
									keyboardType='numeric'
								/>
							</View>
							<View style={{ flex: 1 }}>
								<TextInput
									value={seatingIncBlows2Str}
									onChangeText={(text: string) => {
										setSeatingIncBlows2Str(text);
										resetMainInc1();
										resetMainInc2();
										resetMainInc3();
										resetMainInc4();
										resetRecoveryLength();

										const seatingIncBlows2: number = parseInt(text);
										if (isNaN(seatingIncBlows2)) {
											setIsSeatingIncPen2Active(false);
											setSeatingIncPen2Str('');
											setIsMainIncBlows1Active(false);
											return;
										}
										const seatingIncBlows1: number = parseInt(seatingIncBlows1Str);
										if (seatingIncBlows1 + seatingIncBlows2 >= 25) {
											setSeatingIncBlows2Str((25 - seatingIncBlows1).toString());
											setSeatingIncPen2Str('');
											setIsSeatingIncPen2Active(true);
											setIsMainIncBlows1Active(false);
											return;
										}
										setIsSeatingIncPen2Active(false);
										setSeatingIncPen2Str('75');
										setIsMainIncBlows1Active(true);
									}}
									editable={isSeatingIncBlows2Active}
									style={(isSeatingIncBlows2Active) ? styles.smallInputBoxActive : styles.smallInputBoxInactive}
									keyboardType='numeric'
								/>
								<TextInput
									value={seatingIncPen2Str}
									onChangeText={(text: string) => {
										setSeatingIncPen2Str(text);
										resetMainInc1();
										resetMainInc2();
										resetMainInc3();
										resetMainInc4();
										resetRecoveryLength();
										const seatingIncPen2: number = parseInt(text);
										if (isNaN(seatingIncPen2)) {
											setIsMainIncBlows1Active(false);
											return;
										}
										setIsMainIncBlows1Active(true);
										if (seatingIncPen2 > 75) {
											setSeatingIncPen2Str('75');
										}
									}}
									editable={isSeatingIncPen2Active}
									style={(isSeatingIncPen2Active) ? styles.smallInputBoxActive : styles.smallInputBoxInactive}
									keyboardType='numeric'
								/>
							</View>
						</View>
					</View>
					<View style={{ flex: 4 }}>
						<Text>Test Drive<Text style={{ color: 'red' }}>*</Text></Text>
						<View style={{ flexDirection: 'row' }}>
							<View style={{ flex: 1 }}>
								<TextInput
									value={mainIncBlows1Str}
									onChangeText={(text: string) => {
										setMainIncBlows1Str(text);
										resetMainInc2();
										resetMainInc3();
										resetMainInc4();
										resetRecoveryLength();

										const mainIncBlows1: number = parseInt(text);
										if (isNaN(mainIncBlows1)) {
											setIsMainIncPen1Active(false);
											setMainIncPen1Str('');
											setIsMainIncBlows2Active(false);
											return;
										}
										if (mainIncBlows1 >= 50) {
											setMainIncBlows1Str('50');
											setMainIncPen1Str('');
											setIsMainIncPen1Active(true);
											setIsMainIncBlows2Active(false);
											return;
										}
										setIsMainIncPen1Active(false);
										setMainIncPen1Str('75');
										setIsMainIncBlows2Active(true);
									}}
									editable={isMainIncBlows1Active}
									style={(isMainIncBlows1Active) ? styles.smallInputBoxActive : styles.smallInputBoxInactive}
									keyboardType='numeric'
								/>
								<TextInput
									value={mainIncPen1Str}
									onChangeText={(text: string) => {
										setMainIncPen1Str(text);
										resetMainInc2();
										resetMainInc3();
										resetMainInc4();
										resetRecoveryLength();
										const mainIncPen1: number = parseInt(text);
										if (isNaN(mainIncPen1)) {
											return;
										}
										if (mainIncPen1 > 75) {
											setMainIncPen1Str('75');
										}
									}}
									editable={isMainIncPen1Active}
									style={(isMainIncPen1Active) ? styles.smallInputBoxActive : styles.smallInputBoxInactive}
									keyboardType='numeric'
								/>
							</View>
							<View style={{ flex: 1 }}>
								<TextInput
									value={mainIncBlows2Str}
									onChangeText={(text: string) => {
										setMainIncBlows2Str(text);
										resetMainInc3();
										resetMainInc4();
										resetRecoveryLength();

										const mainIncBlows2: number = parseInt(text);
										if (isNaN(mainIncBlows2)) {
											setIsMainIncPen2Active(false);
											setMainIncPen2Str('');
											setIsMainIncBlows3Active(false);
											return;
										}
										const mainIncBlows1: number = parseInt(mainIncBlows1Str);
										if (mainIncBlows1 + mainIncBlows2 >= 50) {
											setMainIncBlows2Str((50 - mainIncBlows1).toString());
											setMainIncPen2Str('');
											setIsMainIncPen2Active(true);
											setIsMainIncBlows3Active(false);
											return;
										}
										setIsMainIncPen2Active(false);
										setMainIncPen2Str('75');
										setIsMainIncBlows3Active(true);
									}}
									editable={isMainIncBlows2Active}
									style={(isMainIncBlows2Active) ? styles.smallInputBoxActive : styles.smallInputBoxInactive}
									keyboardType='numeric'
								/>
								<TextInput
									value={mainIncPen2Str}
									onChangeText={(text: string) => {
										setMainIncPen2Str(text);
										resetMainInc3();
										resetMainInc4();
										resetRecoveryLength();
										const mainIncPen2: number = parseInt(text);
										if (isNaN(mainIncPen2)) {
											return;
										}
										if (mainIncPen2 > 75) {
											setMainIncPen2Str('75');
										}
									}}
									editable={isMainIncPen2Active}
									style={(isMainIncPen2Active) ? styles.smallInputBoxActive : styles.smallInputBoxInactive}
									keyboardType='numeric'
								/>
							</View>
							<View style={{ flex: 1 }}>
								<TextInput
									value={mainIncBlows3Str}
									onChangeText={(text: string) => {
										setMainIncBlows3Str(text);
										resetMainInc4();
										resetRecoveryLength();

										const mainIncBlows3: number = parseInt(text);
										if (isNaN(mainIncBlows3)) {
											setIsMainIncPen3Active(false);
											setMainIncPen3Str('');
											setIsMainIncBlows4Active(false);
											return;
										}
										const mainIncBlows1: number = parseInt(mainIncBlows1Str);
										const mainIncBlows2: number = parseInt(mainIncBlows2Str);
										if (mainIncBlows1 + mainIncBlows2 + mainIncBlows3 >= 50) {
											setMainIncBlows3Str((50 - mainIncBlows1 - mainIncBlows2).toString());
											setMainIncPen3Str('');
											setIsMainIncPen3Active(true);
											setIsMainIncBlows4Active(false);
											return;
										}
										setIsMainIncPen3Active(false);
										setMainIncPen3Str('75');
										setIsMainIncBlows4Active(true);
									}}
									editable={isMainIncBlows3Active}
									style={(isMainIncBlows3Active) ? styles.smallInputBoxActive : styles.smallInputBoxInactive}
									keyboardType='numeric'
								/>
								<TextInput
									value={mainIncPen3Str}
									onChangeText={(text: string) => {
										setMainIncPen3Str(text);
										resetMainInc4();
										resetRecoveryLength();
										const mainIncPen3: number = parseInt(text);
										if (isNaN(mainIncPen3)) {
											return;
										}
										if (mainIncPen3 > 75) {
											setMainIncPen3Str('75');
										}
									}}
									editable={isMainIncPen3Active}
									style={(isMainIncPen3Active) ? styles.smallInputBoxActive : styles.smallInputBoxInactive}
									keyboardType='numeric'
								/>
							</View>
							<View style={{ flex: 1 }}>
								<TextInput
									value={mainIncBlows4Str}
									onChangeText={(text: string) => {
										setMainIncBlows4Str(text);
										resetRecoveryLength();
										const mainIncBlows4: number = parseInt(text);
										if (isNaN(mainIncBlows4)) {
											setIsMainIncPen4Active(false);
											setMainIncPen4Str('');
											return;
										}
										const mainIncBlows1: number = parseInt(mainIncBlows1Str);
										const mainIncBlows2: number = parseInt(mainIncBlows2Str);
										const mainIncBlows3: number = parseInt(mainIncBlows3Str);
										if (mainIncBlows1 + mainIncBlows2 + mainIncBlows3 + mainIncBlows4 >= 50) {
											setMainIncBlows4Str((50 - mainIncBlows1 - mainIncBlows2 - mainIncBlows3).toString());
											setMainIncPen4Str('');
											setIsMainIncPen4Active(true);
											return;
										}
										setIsMainIncPen4Active(false);
										setMainIncPen4Str('75');
									}}
									editable={isMainIncBlows4Active}
									style={(isMainIncBlows4Active) ? styles.smallInputBoxActive : styles.smallInputBoxInactive}
									keyboardType='numeric'
								/>
								<TextInput
									value={mainIncPen4Str}
									onChangeText={(text: string) => {
										setMainIncPen4Str(text);
										resetRecoveryLength();
										const mainIncPen4: number = parseInt(text);
										if (isNaN(mainIncPen4)) {
											return;
										}
										if (mainIncPen4 > 75) {
											setMainIncPen4Str('75');
										}
									}}
									editable={isMainIncPen4Active}
									style={(isMainIncPen4Active) ? styles.smallInputBoxActive : styles.smallInputBoxInactive}
									keyboardType='numeric'
								/>
							</View>
						</View>
					</View>
				</View>
				<View style={{ flexDirection: 'row' }}>
					<Text style={{ paddingVertical: 10 }}>Dominant Colour<Text style={{ color: 'red' }}>*</Text>: </Text>
					<View style={{ flex: 1 }}>
						<TouchableOpacity 
							onPress={() => setIsSelectDominantColourPressed(prev => !prev)}
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
											style={[styles.listItem, {backgroundColor: item.colourCode}]}>
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
							onPress={() => setIsSelectSecondaryColourPressed(prev => !prev)}
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
											style={[styles.listItem, {backgroundColor: item.colourCode}]}>
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
					<Text style={{ paddingVertical: 10 }}>Dominant Soil Type<Text style={{ color: 'red' }}>*</Text>: </Text>
					<View style={{ flex: 1 }}>
						<TouchableOpacity 
							onPress={() => setIsSelectDominantSoilTypePressed(prev => !prev)}
							style={{
								borderWidth: 0.5,
								alignItems: 'center',
								padding: 10,
								width: '100%',
							}}>
							<Text>{dominantSoilType}</Text>
						</TouchableOpacity>
						{
							isSelectDominantSoilTypePressed && (
								<FlatList
									data={DOMINANT_SOIL_TYPE_LIST}
									keyExtractor={item => item}
									renderItem={({ item }) => (
										<TouchableOpacity 
											onPress={() => {
												setDominantSoilType(item);
												setIsSelectDominantSoilTypePressed(false);
												setSecondarySoilType(undefined);
											}}
											style={[styles.listItem]}>
											<Text>{item}</Text>
										</TouchableOpacity>
									)}
								/>
							)
						}
					</View>
				</View>
				<View style={{ flexDirection: 'row' }}>
					<Text style={{ paddingVertical: 10 }}>Secondary Soil Type: </Text>
					<View style={{ flex: 1 }}>
						<TouchableOpacity 
							onPress={() => setIsSelectSecondarySoilTypePressed(prev => !prev)}
							style={{
								borderWidth: 0.5,
								alignItems: 'center',
								padding: 10,
								width: '100%',
							}}>
							<Text>{secondarySoilType}</Text>
						</TouchableOpacity>
						{
							isSelectSecondarySoilTypePressed && (
								<FlatList
									data={(!dominantSoilType) ? [] : SECONDARY_SOIL_TYPE_LIST_BASED_ON_DOMINANT_SOIL_TYPE[dominantSoilType]}
									keyExtractor={item => item}
									renderItem={({ item }) => (
										<TouchableOpacity 
											onPress={() => {
												setSecondarySoilType(item);
												setIsSelectSecondarySoilTypePressed(false);
											}}
											style={[styles.listItem]}>
											<Text>{item}</Text>
										</TouchableOpacity>
									)}
								/>
							)
						}
					</View>
				</View>
				<View style={{ flexDirection: 'row' }}>
					<Text style={{ paddingVertical: 10 }}>Other Properties: </Text>
					<View style={{ flex: 1 }}>
						<TouchableOpacity 
							onPress={() => setIsSelectOtherPropertiesPressed(prev => !prev)}
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
									data={(!dominantSoilType) ? [] : OTHER_PROPERTIES_LIST_BASED_ON_DOMINANT_SOIL_TYPE[dominantSoilType]}
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
								/>
							)
						}
					</View>
				</View>
				<View style={{ flexDirection: 'row', alignItems: 'center' }}>
					<Text>Recovery(mm)<Text style={{ color: 'red' }}>*</Text>: </Text>
					<TextInput
						value={recoveryLengthInMillimetresStr}
						onChangeText={(text: string) => {
							const totalPenetrationDepthInMillimetres: number = (
								parseInt((!seatingIncPen1Str) ? '0' : seatingIncPen1Str)
								+ parseInt((!seatingIncPen2Str) ? '0' : seatingIncPen2Str)
								+ parseInt((!mainIncPen1Str) ? '0' : mainIncPen1Str)
								+ parseInt((!mainIncPen2Str) ? '0' : mainIncPen2Str)
								+ parseInt((!mainIncPen3Str) ? '0' : mainIncPen3Str)
								+ parseInt((!mainIncPen4Str) ? '0' : mainIncPen4Str)
							);
							if (isNaN(totalPenetrationDepthInMillimetres) || totalPenetrationDepthInMillimetres === 0) {
								return;
							}
							setRecoveryLengthInMillimetresStr(text);
							const recoveryLength: number = parseInt(text);
							if (isNaN(recoveryLength)) {
								return;
							}
							if (recoveryLength > totalPenetrationDepthInMillimetres) {
								setRecoveryLengthInMillimetresStr(totalPenetrationDepthInMillimetres.toString());
							}
						}}
						style={{ borderWidth: 0.5, textAlign: 'center', padding: 10, width: 70 }}
						keyboardType='numeric'
					/>
					<Text>
						{(() => {
							const total = (
								parseInt((!seatingIncPen1Str) ? '0' : seatingIncPen1Str)
								+ parseInt((!seatingIncPen2Str) ? '0' : seatingIncPen2Str)
								+ parseInt((!mainIncPen1Str) ? '0' : mainIncPen1Str)
								+ parseInt((!mainIncPen2Str) ? '0' : mainIncPen2Str)
								+ parseInt((!mainIncPen3Str) ? '0' : mainIncPen3Str)
								+ parseInt((!mainIncPen4Str) ? '0' : mainIncPen4Str)
							);
							return (total > 0) ? `   /   ${total}` : undefined;
						})()}
					</Text>
				</View>
			</View>
			<Button
				title='Confirm'
				onPress={() => {
					if (isNaN(parseFloat(topDepthInMetresStr))) {
						alert('Error: Top Depth');
						return;
					}
					if (!dominantColour) {
						alert('Error: Dominant Colour');
						return;
					}
					if (!dominantSoilType) {
						alert('Error: Dominant Soil Type');
						return;
					}
					if (isNaN(parseInt(seatingIncBlows1Str))) {
						alert(`Error: seatingIncBlows1Str`);
						return;
					}
					if (isNaN(parseInt(seatingIncPen1Str))) {
						alert(`Error: seatingIncPen1Str`);
						return;
					}
					if (parseInt(seatingIncBlows1Str) < 25) {
						if (isNaN(parseInt(seatingIncBlows2Str))) {
							alert(`Error: seatingIncBlows2Str`);
							return;
						}
						if (isNaN(parseInt(seatingIncPen2Str))) {
							alert(`Error: seatingIncPen2Str`);
							return;
						}
					}
					if (isNaN(parseInt(mainIncBlows1Str))) {
						alert(`Error: mainIncBlows1Str`);
						return;
					}
					if (isNaN(parseInt(mainIncPen1Str))) {
						alert(`Error: mainIncPen1Str`);
						return;
					}
					if (parseInt(mainIncBlows1Str) < 50) {
						if (isNaN(parseInt(mainIncBlows2Str))) {
							alert(`Error: mainIncBlows2Str`);
							return;
						}
						if (isNaN(parseInt(mainIncPen2Str))) {
							alert(`Error: mainIncPen2Str`);
							return;
						}
					}
					if (parseInt(mainIncBlows1Str) + parseInt(mainIncBlows2Str) < 50) {
						if (isNaN(parseInt(mainIncBlows3Str))) {
							alert(`Error: mainIncBlows3Str`);
							return;
						}
						if (isNaN(parseInt(mainIncPen3Str))) {
							alert(`Error: mainIncPen3Str`);
							return;
						}
					}
					if (parseInt(mainIncBlows1Str) + parseInt(mainIncBlows2Str) + parseInt(mainIncBlows3Str) < 50) {
						if (isNaN(parseInt(mainIncBlows4Str))) {
							alert(`Error: mainIncBlows4Str`);
							return;
						}
						if (isNaN(parseInt(mainIncPen4Str))) {
							alert(`Error: mainIncPen4Str`);
							return;
						}
					}
					if (isNaN(parseInt(recoveryLengthInMillimetresStr))) {
						alert('Error: Recovery Length');
						return;
					}

					const topDepthInMetres: number = parseFloat(parseFloat(topDepthInMetresStr).toFixed(3));
					const topDepthInMillimetres: number = topDepthInMetres * 1000;
					const seatingIncBlows1: number = parseInt(seatingIncBlows1Str);
					const seatingIncPen1: number = parseInt(seatingIncPen1Str);
					const seatingIncBlows2: number = isNaN(parseInt(seatingIncBlows2Str)) ? 0 : parseInt(seatingIncBlows2Str);
					const seatingIncPen2: number = isNaN(parseInt(seatingIncPen2Str)) ? 0 : parseInt(seatingIncPen2Str);
					const mainIncBlows1: number = isNaN(parseInt(mainIncBlows1Str)) ? 0 : parseInt(mainIncBlows1Str);
					const mainIncPen1: number = isNaN(parseInt(mainIncPen1Str)) ? 0 : parseInt(mainIncPen1Str);
					const mainIncBlows2: number = isNaN(parseInt(mainIncBlows2Str)) ? 0 : parseInt(mainIncBlows2Str);
					const mainIncPen2: number = isNaN(parseInt(mainIncPen2Str)) ? 0 : parseInt(mainIncPen2Str);
					const mainIncBlows3: number = isNaN(parseInt(mainIncBlows3Str)) ? 0 : parseInt(mainIncBlows3Str);
					const mainIncPen3: number = isNaN(parseInt(mainIncPen3Str)) ? 0 : parseInt(mainIncPen3Str);
					const mainIncBlows4: number = isNaN(parseInt(mainIncBlows4Str)) ? 0 : parseInt(mainIncBlows4Str);
					const mainIncPen4: number = isNaN(parseInt(mainIncPen4Str)) ? 0 : parseInt(mainIncPen4Str);
					const totalPenetrationDepthInMillimetres: number = (
						seatingIncPen1 + seatingIncPen2 + mainIncPen1 + mainIncPen2 + mainIncPen3 + mainIncPen4
					);
					const baseDepthInMetres: number = (topDepthInMillimetres + totalPenetrationDepthInMillimetres) / 1000;
					const sptNValue: number = mainIncBlows1 + mainIncBlows2 + mainIncBlows3 + mainIncBlows4;
					const recoveryLengthInMillimetres: number = parseInt(recoveryLengthInMillimetresStr);
					if (recoveryLengthInMillimetres > totalPenetrationDepthInMillimetres) {
						alert('Error: Recovery Length');
						console.log(`Recovery Length = ${recoveryLengthInMillimetres}`);
						console.log(`topDepth = ${topDepthInMetres}`);
						console.log(`baseDepth = ${baseDepthInMetres}`);
						console.log(`baseDepth - topDepth = ${baseDepthInMetres - topDepthInMetres}`);
						console.log(`(baseDepth - topDepth) * 1000 = ${(baseDepthInMetres - topDepthInMetres) * 1000}`);
						return;
					}

					let soilDescription: string = '';

					let consistency = '';
					if (dominantSoilType === 'SAND' || dominantSoilType === 'GRAVEL') {
						if (sptNValue < 4) {
							consistency = 'Very Loose';
						} else if (sptNValue < 10) {
							consistency = 'Loose';
						} else if (sptNValue < 30) {
							consistency = 'Medium Dense';
						} else if (sptNValue < 50) {
							consistency = 'Dense';
						} else {
							consistency = 'Very Dense';
						}
					} else {
						if (sptNValue < 2) {
							consistency = 'Very Soft';
						} else if (sptNValue < 4) {
							consistency = 'Soft';
						} else if (sptNValue < 8) {
							consistency = 'Firm';
						} else if (sptNValue < 15) {
							consistency = 'Stiff';
						} else if (sptNValue <= 30) {
							consistency = 'Very Stiff';
						} else {
							consistency = 'Hard';
						}
					}
					soilDescription += `${consistency},`;

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
					soilDescription += ` ${colourLevel}`;

					let colourDescription = '';
					if (!secondaryColour) {
						colourDescription = `${dominantColour.colourNameForSoilDescription}`;
					} else {
						colourDescription = `${secondaryColour.colourNameForSoilDescription} ${dominantColour.colourNameForSoilDescription}`;
					}
					soilDescription += ` ${colourDescription}`;

					if (!secondarySoilType) {
						soilDescription += ` ${dominantSoilType}`;
					} else {
						soilDescription += ` ${secondarySoilType} ${dominantSoilType}`;
					}
					if (otherProperties) {
						soilDescription += ` ${otherProperties}`;
					}

					const sptIndex: number = blocks.filter((block: Block) => block.blockType === 'Spt').length + 1;
					const disturbedSampleIndex: number = (recoveryLengthInMillimetres === 0) ? -1 : blocks.filter((block: Block) => block.blockType === 'Spt' && block.recoveryLengthInMillimetres > 0).length + 1;

					const newSptBlock: Block = {
						id: blocks.length + 1, 
						blockTypeId: SPT_BLOCK_TYPE_ID,
						blockType: 'Spt',
						boreholeId: boreholeId, 
						sptIndex: sptIndex,
						disturbedSampleIndex: disturbedSampleIndex,
						blockId: 1,
						topDepthInMetres: topDepthInMetres,
						baseDepthInMetres: baseDepthInMetres,
						soilDescription: soilDescription,
						seatingIncBlows1: seatingIncBlows1,
						seatingIncPen1: seatingIncPen1,
						seatingIncBlows2: seatingIncBlows2,
						seatingIncPen2: seatingIncPen2,
						mainIncBlows1: mainIncBlows1,
						mainIncPen1: mainIncPen1,
						mainIncBlows2: mainIncBlows2,
						mainIncPen2: mainIncPen2,
						mainIncBlows3: mainIncBlows3,
						mainIncPen3: mainIncPen3,
						mainIncBlows4: mainIncBlows4,
						mainIncPen4: mainIncPen4,
						sptNValue: sptNValue,
						recoveryLengthInMillimetres: recoveryLengthInMillimetres,
					};
					setBlocks(blocks => [...blocks, newSptBlock]);
					setIsAddNewBlockButtonPressed(false);
				}}
			/>
		</GestureHandlerRootView>
	);
}

const styles = StyleSheet.create({
	smallInputBoxActive: {
		borderWidth: 0.5, 
		textAlign: 'center', 
		paddingVertical: 10,
		backgroundColor: 'transparent',
	},
	smallInputBoxInactive: {
		borderWidth: 0.5, 
		textAlign: 'center', 
		paddingVertical: 10,
		backgroundColor: 'rgba(0, 0, 0, 0.3)',
	},
	listItem: {
		borderLeftWidth: 0.25,
		borderRightWidth: 0.25,
		borderBottomWidth: 0.25,
		alignItems: 'center',
		padding: 10,
	}
});