import { useState } from "react";
import { View, Keyboard, StyleSheet, Text, TextInput, TouchableOpacity } from "react-native";
import { FlatList, GestureHandlerRootView } from "react-native-gesture-handler";

import { Colour, DOMINANT_COLOUR_LIST, SECONDARY_COLOUR_LIST } from "@/constants/colour";
import {
	DOMINANT_SOIL_TYPE_LIST,
	DominantSoilType,
	OTHER_PROPERTIES_LIST_BASED_ON_DOMINANT_SOIL_TYPE,
	SECONDARY_SOIL_TYPE_LIST_BASED_ON_DOMINANT_SOIL_TYPE,
	SecondarySoilType
} from "@/constants/soil";
import { styles } from "@/constants/styles";

export const DEFAULT_SOIL_POSITION_TYPE = '' as const;
export const TOP_SOIL_POSITION_TYPE = 'Top ' as const;
export const BOTTOM_SOIL_POSITION_TYPE = 'Bottom ' as const;

export const SOIL_POSITION_TYPE_LIST = [
  DEFAULT_SOIL_POSITION_TYPE,
  TOP_SOIL_POSITION_TYPE,
  BOTTOM_SOIL_POSITION_TYPE,
] as const;

export type SoilPositionType = typeof SOIL_POSITION_TYPE_LIST[number];

export type SoilPropertiesInputQuestionsProps = {
  recovery: number;
  soilPositionType: SoilPositionType;
  dominantColour: Colour | null; setDominantColour: React.Dispatch<React.SetStateAction<Colour | null>>;
  secondaryColour: Colour | null; setSecondaryColour: React.Dispatch<React.SetStateAction<Colour | null>>;
  dominantSoilType: DominantSoilType | null; setDominantSoilType: React.Dispatch<React.SetStateAction<DominantSoilType | null>>;
  secondarySoilType: SecondarySoilType | null; setSecondarySoilType: React.Dispatch<React.SetStateAction<SecondarySoilType | null>>;
  otherProperties: string; setOtherProperties: React.Dispatch<React.SetStateAction<string>>;
}

export function SoilPropertiesInputQuestions({
  recovery,
  soilPositionType,
  dominantColour, setDominantColour, 
  secondaryColour, setSecondaryColour, 
  dominantSoilType, setDominantSoilType, 
  secondarySoilType, setSecondarySoilType, 
  otherProperties, setOtherProperties, 
}: SoilPropertiesInputQuestionsProps) {

  if (isNaN(recovery) || recovery <= 0) {
    return <></>;
  }

  const [isSelectDominantColourPressed, setIsSelectDominantColourPressed] = useState<boolean>(false);
  const [isSelectSecondaryColourPressed, setIsSelectSecondaryColourPressed] = useState<boolean>(false);
  const [isSelectDominantSoilTypePressed, setIsSelectDominantSoilTypePressed] = useState<boolean>(false);
  const [isSelectSecondarySoilTypePressed, setIsSelectSecondarySoilTypePressed] = useState<boolean>(false);
  const [isSelectOtherPropertiesPressed, setIsSelectOtherPropertiesPressed] = useState<boolean>(false);

  return (
    <>
    <View style={{ flexDirection: 'row' }}>
      <Text style={{ paddingVertical: 10 }}>{soilPositionType}Dominant Colour<Text style={{ color: 'red' }}>*</Text>: </Text>
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
                    Keyboard.dismiss();
                    setDominantColour(item);
                    setIsSelectDominantColourPressed(false);
                    setSecondaryColour(null);
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
      <Text style={{ paddingVertical: 10 }}>{soilPositionType}Secondary Colour: </Text>
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
                    Keyboard.dismiss();
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
      <Text style={{ paddingVertical: 10 }}>{soilPositionType}Dominant Soil Type<Text style={{ color: 'red' }}>*</Text>: </Text>
      <View style={{ flex: 1 }}>
        <TouchableOpacity 
          onPress={() => {
            Keyboard.dismiss();
            setIsSelectDominantSoilTypePressed(prev => !prev);
          }}
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
                    Keyboard.dismiss();
                    setDominantSoilType(item);
                    setIsSelectDominantSoilTypePressed(false);
                    setSecondarySoilType(null);
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
      <Text style={{ paddingVertical: 10 }}>{soilPositionType}Secondary Soil Type: </Text>
      <View style={{ flex: 1 }}>
        <TouchableOpacity 
          onPress={() => {
            Keyboard.dismiss();
            setIsSelectSecondarySoilTypePressed(prev => !prev);
          }}
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
                    Keyboard.dismiss();
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
      <Text style={{ paddingVertical: 10 }}>{soilPositionType}Other Properties: </Text>
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
              data={(!dominantSoilType) ? [] : OTHER_PROPERTIES_LIST_BASED_ON_DOMINANT_SOIL_TYPE[dominantSoilType]}
              keyExtractor={item => item}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  onPress={() => {
                    Keyboard.dismiss();
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
    </>
  );
}
