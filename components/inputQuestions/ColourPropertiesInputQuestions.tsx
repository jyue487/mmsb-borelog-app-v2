import { useState } from "react";
import { View, Keyboard, StyleSheet, Text, TextInput, TouchableOpacity } from "react-native";
import { FlatList, GestureHandlerRootView } from "react-native-gesture-handler";

import { Colour, DOMINANT_COLOUR_LIST, SECONDARY_COLOUR_LIST } from "@/constants/colour";
import { styles } from "@/constants/styles";
import { ColourProperties } from "@/interfaces/ColourProperties";

type Props = {
  questionPrefix: string;
  colourProperties: ColourProperties;
  setColourProperties: React.Dispatch<React.SetStateAction<ColourProperties>>;
};

export function ColourPropertiesInputQuestions({
  questionPrefix,
  colourProperties,
  setColourProperties,
}: Props) {

  const [dominantColour, setDominantColour] = useState<Colour | null>(colourProperties.dominantColour);
  const [secondaryColour, setSecondaryColour] = useState<Colour | null>(colourProperties.secondaryColour);
  const [isSelectDominantColourPressed, setIsSelectDominantColourPressed] = useState<boolean>(false);
  const [isSelectSecondaryColourPressed, setIsSelectSecondaryColourPressed] = useState<boolean>(false);

  const selectDominantColour = (colour: Colour) => {
    setDominantColour(colour);
    setIsSelectDominantColourPressed(false);
    setColourProperties((cp: ColourProperties) => ({
      ...cp, dominantColour: colour
    }));
  };
  const selectSecondaryColour = (colour: Colour) => {
    setSecondaryColour(colour);
    setIsSelectSecondaryColourPressed(false);
    setColourProperties((cp: ColourProperties) => ({
      ...cp, secondaryColour: colour
    }));
  };
  const resetSecondaryColour = () => {
    setSecondaryColour(null);
    setIsSelectSecondaryColourPressed(false);
    setColourProperties((cp: ColourProperties) => ({
      ...cp, secondaryColour: null
    }));
  };

  return (
    <>
    <View style={{ flexDirection: 'row' }}>
      <Text style={{ paddingVertical: 10 }}>{questionPrefix}Dominant Colour<Text style={{ color: 'red' }}>*</Text>: </Text>
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
                    selectDominantColour(item);
                    resetSecondaryColour();
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
      <Text style={{ paddingVertical: 10 }}>{questionPrefix}Secondary Colour: </Text>
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
                    selectSecondaryColour(item);
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
    </>
  );
}